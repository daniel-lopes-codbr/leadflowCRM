-- LeadFlow CRM — Row Level Security (isolamento de tenants por workspace_id)
-- Ver PRD §4.2: "queries não devem vazar dados de um workspace_id para outro".

-- Helpers ------------------------------------------------------------------
-- security invoker (padrão): dependem de memberships já estar filtrado pela
-- própria RLS de memberships (policy "memberships_select_own_or_admin"),
-- então não há recursão nem elevação de privilégio aqui.

create function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security invoker
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where memberships.workspace_id = target_workspace_id
      and memberships.user_id = auth.uid()
  );
$$;

create function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
security invoker
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where memberships.workspace_id = target_workspace_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'admin'
  );
$$;

-- workspaces -----------------------------------------------------------------

alter table public.workspaces enable row level security;

create policy workspaces_select_member
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

create policy workspaces_insert_any_authenticated
  on public.workspaces for insert
  to authenticated
  with check (true);

create policy workspaces_update_admin
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

create policy workspaces_delete_admin
  on public.workspaces for delete
  to authenticated
  using (public.is_workspace_admin(id));

grant select, insert, update, delete on public.workspaces to authenticated;

-- memberships ------------------------------------------------------------------

alter table public.memberships enable row level security;

create policy memberships_select_own_or_admin
  on public.memberships for select
  to authenticated
  using (user_id = auth.uid() or public.is_workspace_admin(workspace_id));

-- Bootstrap: o criador do workspace ainda não é admin (nenhuma membership
-- existe), então ele pode criar a própria membership inicial. Depois disso,
-- só admins podem inserir novas memberships (convites).
create policy memberships_insert_bootstrap_or_admin
  on public.memberships for insert
  to authenticated
  with check (
    (
      user_id = auth.uid()
      and not exists (
        select 1 from public.memberships m2
        where m2.workspace_id = memberships.workspace_id
      )
    )
    or public.is_workspace_admin(workspace_id)
  );

create policy memberships_update_admin
  on public.memberships for update
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy memberships_delete_admin_or_self
  on public.memberships for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id) or user_id = auth.uid());

grant select, insert, update, delete on public.memberships to authenticated;

-- leads --------------------------------------------------------------------------

alter table public.leads enable row level security;

create policy leads_select_member
  on public.leads for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy leads_insert_member
  on public.leads for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy leads_update_member
  on public.leads for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy leads_delete_member
  on public.leads for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

grant select, insert, update, delete on public.leads to authenticated;

-- deals --------------------------------------------------------------------------

alter table public.deals enable row level security;

create policy deals_select_member
  on public.deals for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy deals_insert_member
  on public.deals for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy deals_update_member
  on public.deals for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy deals_delete_member
  on public.deals for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

grant select, insert, update, delete on public.deals to authenticated;

-- activities -----------------------------------------------------------------------

alter table public.activities enable row level security;

create policy activities_select_member
  on public.activities for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy activities_insert_member
  on public.activities for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy activities_update_member
  on public.activities for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy activities_delete_member
  on public.activities for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

grant select, insert, update, delete on public.activities to authenticated;

-- audit_logs -------------------------------------------------------------------------
-- Trilha de auditoria imutável: só admins leem, e só o backend (service_role,
-- que ignora RLS) escreve. Nenhuma policy de insert/update/delete é criada de
-- propósito — o grant abaixo também não inclui essas operações para `authenticated`.

alter table public.audit_logs enable row level security;

create policy audit_logs_select_admin
  on public.audit_logs for select
  to authenticated
  using (public.is_workspace_admin(workspace_id));

grant select on public.audit_logs to authenticated;
