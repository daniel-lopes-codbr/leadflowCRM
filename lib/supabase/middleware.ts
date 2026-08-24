import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Páginas que só fazem sentido pra quem ainda não está logado — landing,
// login, cadastro. Quem já tem sessão é mandado pro próprio workspace.
const LOGGED_OUT_ONLY_PATHS = ["/", "/login", "/signup"];
const PROTECTED_PATHS = ["/onboarding", "/join"];
const PUBLIC_TOP_SEGMENTS = new Set([
  "login",
  "signup",
  "onboarding",
  "join",
  "auth",
  "termos",
  "privacidade",
]);

function isWorkspaceRoute(pathname: string) {
  const [first] = pathname.split("/").filter(Boolean);
  return !!first && !PUBLIC_TOP_SEGMENTS.has(first);
}

function isProtected(pathname: string) {
  return (
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    isWorkspaceRoute(pathname)
  );
}

// `next` chega como query param de fora (link, bookmark, redirect encadeado).
// Só aceitamos caminho relativo de origem única — bloqueia
// `//evil.com`, `https://evil.com` e `/\evil.com` (open redirect).
function isSafeNextPath(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && LOGGED_OUT_ONLY_PATHS.includes(pathname)) {
    const rawNext = request.nextUrl.searchParams.get("next");
    if (isSafeNextPath(rawNext)) {
      return NextResponse.redirect(new URL(rawNext, request.url));
    }

    // Sem `next` explícito: manda quem já está logado pro workspace que já
    // tem, em vez de sempre jogar pra tela de criar um novo (só cai em
    // /onboarding quem realmente ainda não tem nenhum).
    const { data: membership } = await supabase
      .from("memberships")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const fallback = membership ? `/${membership.workspace_id}/dashboard` : "/onboarding";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return response;
}
