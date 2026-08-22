import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service_role key — ignora RLS. Uso restrito a Server Actions
 * e Route Handlers de confiança (ex.: gravação em audit_logs, webhooks do
 * Stripe). O import "server-only" faz o build falhar caso este módulo seja
 * puxado por engano para um Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
