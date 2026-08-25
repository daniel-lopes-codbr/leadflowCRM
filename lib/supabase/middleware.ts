import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSafeNextPath } from "@/lib/utils";

// Páginas que só fazem sentido pra quem ainda não está logado — landing,
// login, cadastro. Quem já tem sessão é mandado pro próprio workspace.
const LOGGED_OUT_ONLY_PATHS = ["/", "/login", "/signup"];
// /join fica de fora: a própria página já trata usuário autenticado e
// não-autenticado (mostra link de cadastro com o token pra quem ainda não
// tem conta) e a Server Action de aceite revalida sessão/e-mail por conta
// própria — bloquear a rota aqui só quebrava esse fluxo pra quem ainda não
// tinha login (media redirecionado pro /login sem o contexto do convite).
const PROTECTED_PATHS = ["/onboarding"];
const PUBLIC_TOP_SEGMENTS = new Set([
  "login",
  "signup",
  "onboarding",
  "join",
  "auth",
  "termos",
  "privacidade",
  // Rotas de API/webhook implementam sua própria autenticação (ex.:
  // verificação de assinatura do Stripe) — não fazem sentido atrás do
  // redirect de sessão do middleware de página.
  "api",
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
