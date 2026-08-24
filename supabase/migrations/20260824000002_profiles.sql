-- LeadFlow CRM — profiles públicos (M10)
-- auth.users não é exposto ao PostgREST, então não dá pra embutir nome/e-mail
-- de responsável/autor em selects (leads, activities, memberships) direto da
-- tabela de auth. profiles espelha auth.users e serve de alvo de FK para
-- essas colunas, permitindo `select(..., profiles(name))`.
--
-- Idempotente de propósito, na linha das outras migrations deste projeto.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Backfill dos usuários já existentes (ex.: contas criadas durante o M9).
insert into public.profiles (id, name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email
from auth.users u
on conflict (id) do nothing;

-- Todo novo signup ganha uma linha em profiles automaticamente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS ------------------------------------------------------------------

alter table public.profiles enable row level security;

-- security definer pelo mesmo motivo de is_workspace_member: a policy de
-- profiles precisa checar memberships sem reativar RLS de memberships.
create or replace function public.shares_workspace_with(target_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m1
    join public.memberships m2 on m1.workspace_id = m2.workspace_id
    where m1.user_id = auth.uid() and m2.user_id = target_user_id
  );
$$;

drop policy if exists profiles_select_self_or_workspacemate on public.profiles;
create policy profiles_select_self_or_workspacemate
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.shares_workspace_with(id));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

grant select, update on public.profiles to authenticated;

-- Repontar FKs de auth.users para public.profiles ------------------------
-- Permite embutir nome/e-mail via PostgREST em memberships/leads/deals/
-- activities. Seguro: o backfill acima garante que todo id hoje válido em
-- auth.users também existe em profiles antes do swap de constraint.

alter table public.memberships drop constraint if exists memberships_user_id_fkey;
alter table public.memberships
  add constraint memberships_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.leads drop constraint if exists leads_owner_id_fkey;
alter table public.leads
  add constraint leads_owner_id_fkey
  foreign key (owner_id) references public.profiles(id) on delete set null;

alter table public.deals drop constraint if exists deals_owner_id_fkey;
alter table public.deals
  add constraint deals_owner_id_fkey
  foreign key (owner_id) references public.profiles(id) on delete set null;

alter table public.activities drop constraint if exists activities_author_id_fkey;
alter table public.activities
  add constraint activities_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;
