"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  { status: "error"; message: string } | { status: "check-email"; message: string };

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult | void> {
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
  const supabase = createClient();
  const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
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
