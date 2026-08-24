-- LeadFlow CRM — convites de membro (M9)
-- Token opaco impede que alguém aceite um convite alheio ou se
-- auto-adicione a um workspace apenas conhecendo o workspace_id.

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.member_role not null default 'member',
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create index if not exists invites_token_idx on public.invites(token);
create index if not exists invites_workspace_id_idx on public.invites(workspace_id);

alter table public.invites enable row level security;

-- Só admins do workspace veem/criam convites. A aceitação (join) é validada
-- e gravada pelo backend com a service_role key, comparando o token e o
-- e-mail autenticado — por isso não há policy de select/insert para o
-- convidado nem policy de update (accepted_at) para nenhuma role de cliente.
drop policy if exists invites_select_admin on public.invites;
create policy invites_select_admin
  on public.invites for select
  to authenticated
  using (public.is_workspace_admin(workspace_id));

drop policy if exists invites_insert_admin on public.invites;
create policy invites_insert_admin
  on public.invites for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists invites_delete_admin on public.invites;
create policy invites_delete_admin
  on public.invites for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));

grant select, insert, delete on public.invites to authenticated;
