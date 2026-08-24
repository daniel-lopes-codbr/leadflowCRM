import "server-only";
import { Resend } from "resend";

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "LeadFlow CRM <onboarding@resend.dev>";

export function createResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}
