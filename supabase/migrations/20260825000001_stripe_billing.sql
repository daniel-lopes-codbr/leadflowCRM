-- LeadFlow CRM — colunas de billing do Stripe em workspaces (M14)
-- stripe_customer_id / stripe_subscription_id não são segredos (só IDs de
-- objeto, sem poder nenhum sem a secret key) — ficam visíveis pra qualquer
-- membro do workspace, igual ao restante da linha, via a policy de select
-- que já existe (workspaces_select_member). Só a service_role (webhook)
-- e admins (via Server Action) escrevem nelas.

alter table public.workspaces
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create unique index if not exists workspaces_stripe_customer_id_idx
  on public.workspaces(stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists workspaces_stripe_subscription_id_idx
  on public.workspaces(stripe_subscription_id)
  where stripe_subscription_id is not null;
