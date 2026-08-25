"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createRatelimiter, getClientIp } from "@/lib/upstash/ratelimit";

export type AuthActionResult =
  { status: "error"; message: string } | { status: "check-email"; message: string };

// Camada extra por IP além do rate limit próprio do Supabase Auth — cobre o
// caso de um único IP variando o e-mail alvo em tentativas automatizadas.
const loginRatelimit = createRatelimiter("login", 10, "60 s");
const signupRatelimit = createRatelimiter("signup", 5, "60 s");

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult | void> {
  const { success } = await loginRatelimit.limit(getClientIp(await headers()));
  if (!success) {
    return { status: "error", message: "Muitas tentativas. Tente novamente em instantes." };
  }

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    return { status: "error", message: "E-mail ou senha inválidos." };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", data.user.id)
    .limit(1)
    .maybeSingle();

  redirect(membership ? `/${membership.workspace_id}/dashboard` : "/onboarding");
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
  next?: string;
}): Promise<AuthActionResult | void> {
  const requestHeaders = await headers();
  const { success } = await signupRatelimit.limit(getClientIp(requestHeaders));
  if (!success) {
    return { status: "error", message: "Muitas tentativas. Tente novamente em instantes." };
  }

  const supabase = createClient();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const next = input.next ?? "/onboarding";

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { status: "error", message: "Já existe uma conta com este e-mail." };
    }
    return { status: "error", message: "Não foi possível criar sua conta. Tente novamente." };
  }

  if (data.session) {
    redirect(next);
  }

  return {
    status: "check-email",
    message: "Enviamos um link de confirmação para o seu e-mail.",
  };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
