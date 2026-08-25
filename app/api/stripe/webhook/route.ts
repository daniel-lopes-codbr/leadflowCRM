import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStripeClient } from "@/lib/stripe/client";

// Sem verificação de sessão Supabase aqui de propósito — é webhook, a
// autenticação é a assinatura HMAC do Stripe, não um cookie de usuário.
// Requer "api" liberado em PUBLIC_TOP_SEGMENTS (lib/supabase/middleware.ts).
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = createStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const workspaceId = session.metadata?.workspace_id;
        if (!workspaceId) break;

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        await admin
          .from("workspaces")
          .update({ plan: "pro", stripe_subscription_id: subscriptionId ?? null })
          .eq("id", workspaceId);

        await admin.from("audit_logs").insert({
          workspace_id: workspaceId,
          event_type: "plan.upgraded",
          metadata: { source: "stripe_checkout" },
        });
        break;
      }

      // Cobre cancelamento (imediato ou fim do período), e falha de
      // pagamento após o Stripe esgotar as tentativas de retry — nesses
      // casos o status deixa de ser active/trialing e isso já é sinal
      // suficiente pra rebaixar o workspace automaticamente.
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceId = subscription.metadata?.workspace_id;
        if (!workspaceId) break;

        const isActive = subscription.status === "active" || subscription.status === "trialing";

        if (isActive) {
          await admin
            .from("workspaces")
            .update({ plan: "pro", stripe_subscription_id: subscription.id })
            .eq("id", workspaceId);
          break;
        }

        const { data: workspace } = await admin
          .from("workspaces")
          .select("plan")
          .eq("id", workspaceId)
          .single();

        if (workspace?.plan === "pro") {
          await admin
            .from("workspaces")
            .update({ plan: "free", stripe_subscription_id: null })
            .eq("id", workspaceId);

          await admin.from("audit_logs").insert({
            workspace_id: workspaceId,
            event_type: "plan.downgraded",
            metadata: { reason: subscription.status },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("stripe webhook handler error", error);
    return NextResponse.json({ error: "Erro ao processar evento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
