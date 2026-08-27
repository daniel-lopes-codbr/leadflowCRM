-- LeadFlow CRM — upload de documentos e anexos em leads (M20)
--
-- Mesma arquitetura já usada em workspace-assets (Supabase Storage,
-- S3-compatible, streaming) — mas privado: anexo de lead é dado de negócio
-- do cliente, não deve ser público como a logo do workspace. Bucket próprio
-- em vez de reaproveitar workspace-assets pra manter policies e limites
-- (tamanho, tipos aceitos) independentes.
--
-- Path convention: lead-attachments/{workspace_id}/{lead_id}/{timestamp}-{nome}
--
-- Idempotente de propósito, na linha das outras migrations deste projeto.

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  storage_path text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists attachments_workspace_id_idx on public.attachments(workspace_id);
create index if not exists attachments_lead_id_idx on public.attachments(lead_id, created_at desc);

alter table public.attachments enable row level security;

drop policy if exists attachments_select_member on public.attachments;
create policy attachments_select_member
  on public.attachments for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists attachments_insert_member on public.attachments;
create policy attachments_insert_member
  on public.attachments for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

drop policy if exists attachments_delete_member on public.attachments;
create policy attachments_delete_member
  on public.attachments for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

grant select, insert, delete on public.attachments to authenticated;

-- Storage ------------------------------------------------------------------
-- Bucket privado: diferente de workspace-assets, anexo de lead não é
-- exposto por URL pública — download exige signed URL gerada sob demanda,
-- checando RLS/membership no momento do pedido.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-attachments',
  'lead-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists lead_attachments_select_member on storage.objects;
create policy lead_attachments_select_member
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'lead-attachments'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists lead_attachments_insert_member on storage.objects;
create policy lead_attachments_insert_member
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'lead-attachments'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists lead_attachments_delete_member on storage.objects;
create policy lead_attachments_delete_member
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'lead-attachments'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );
