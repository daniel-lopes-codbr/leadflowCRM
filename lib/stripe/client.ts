import "server-only";
import Stripe from "stripe";

export function createStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
