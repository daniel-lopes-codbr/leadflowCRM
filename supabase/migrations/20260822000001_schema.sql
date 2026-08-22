-- LeadFlow CRM — schema inicial (multi-tenant por workspace_id)
-- Ver PRD §3 (escopo funcional) e §4.2 (isolamento de tenants via RLS).

create extension if not exists pgcrypto;

-- Enums --------------------------------------------------------------------

create type public.member_role as enum ('admin', 'member');

create type public.workspace_plan as enum ('free', 'pro');

create type public.pipeline_status as enum (
  'Novo Lead',
  'Contato Realizado',
  'Proposta Enviada',
  'Negociação',
  'Fechado Ganho',
  'Fechado Perdido'
);

create type public.activity_type as enum ('Ligação', 'E-mail', 'Reunião', 'Nota');

create type public.audit_event_type as enum (
  'workspace.created',
  'workspace.deleted',
  'plan.upgraded',
  'plan.downgraded',
  'member.invited',
  'member.removed',
  'data.exported'
);

-- updated_at helper ----------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- workspaces -----------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  logo_url text,
  plan public.workspace_plan not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- memberships (usuário <-> workspace, com papel) ------------------------------

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index memberships_user_id_idx on public.memberships(user_id);
create index memberships_workspace_id_idx on public.memberships(workspace_id);

-- leads ------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  email text,
  phone text,
  company text,
  role text,
  status public.pipeline_status not null default 'Novo Lead',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_workspace_id_idx on public.leads(workspace_id);
create index leads_owner_id_idx on public.leads(owner_id);
create index leads_status_idx on public.leads(workspace_id, status);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- deals --------------------------------------------------------------------------

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null check (char_length(trim(title)) > 0),
  value numeric(12, 2) not null default 0 check (value >= 0),
  status public.pipeline_status not null default 'Novo Lead',
  owner_id uuid references auth.users(id) on delete set null,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_workspace_id_idx on public.deals(workspace_id);
create index deals_lead_id_idx on public.deals(lead_id);
create index deals_owner_id_idx on public.deals(owner_id);
create index deals_status_idx on public.deals(workspace_id, status);

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- activities (timeline) -----------------------------------------------------------

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  type public.activity_type not null,
  description text not null check (char_length(trim(description)) > 0),
  author_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index activities_workspace_id_idx on public.activities(workspace_id);
create index activities_lead_id_idx on public.activities(lead_id, occurred_at desc);

-- audit_logs (eventos críticos de negócio, ver PRD §4.3) ---------------------------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type public.audit_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_workspace_id_idx on public.audit_logs(workspace_id, created_at desc);
