"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/client";

export type BillingActionResult = { status: "error"; message: string };

async function requireAdmin(workspaceId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: { status: "error" as const, message: "Sessão expirada. Faça login novamente." },
    };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "admin") {
    return {
      error: { status: "error" as const, message: "Só administradores podem gerenciar o plano." },
    };
  }

  return { supabase };
}

export async function createCheckoutSession(workspaceId: string): Promise<BillingActionResult | void> {
  const check = await requireAdmin(workspaceId);
  if ("error" in check) return check.error;
  const { supabase } = check;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, plan, stripe_customer_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { status: "error", message: "Workspace não encontrado." };
  }
  if (workspace.plan === "pro") {
    return { status: "error", message: "Este workspace já está no plano Pro." };
  }

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    return { status: "error", message: "Stripe não configurado (falta o price do plano Pro)." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = createStripeClient();

  let customerId = workspace.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: workspace.name,
      metadata: { workspace_id: workspaceId },
    });
    customerId = customer.id;

    const admin = createAdminClient();
    await admin.from("workspaces").update({ stripe_customer_id: customerId }).eq("id", workspaceId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/${workspaceId}/settings?tab=plans&checkout=success`,
    cancel_url: `${appUrl}/${workspaceId}/settings?tab=plans&checkout=cancelled`,
    subscription_data: { metadata: { workspace_id: workspaceId } },
    metadata: { workspace_id: workspaceId },
  });

  if (!session.url) {
    return { status: "error", message: "Não foi possível iniciar o checkout." };
  }

  redirect(session.url);
}

export async function createPortalSession(workspaceId: string): Promise<BillingActionResult | void> {
  const check = await requireAdmin(workspaceId);
  if ("error" in check) return check.error;
  const { supabase } = check;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace?.stripe_customer_id) {
    return { status: "error", message: "Nenhuma assinatura encontrada para este workspace." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = createStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${appUrl}/${workspaceId}/settings?tab=plans`,
  });

  redirect(session.url);
}
