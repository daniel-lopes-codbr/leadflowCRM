import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ONLY_PATHS = ["/login", "/signup"];
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

  if (user && AUTH_ONLY_PATHS.includes(pathname)) {
    const next = request.nextUrl.searchParams.get("next") ?? "/onboarding";
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}
