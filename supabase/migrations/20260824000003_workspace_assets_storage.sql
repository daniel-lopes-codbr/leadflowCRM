-- LeadFlow CRM — bucket de storage pra logo do workspace (M13)
-- Path convention: workspace-assets/{workspace_id}/logo-{timestamp}.{ext}
-- Bucket público (logo aparece em e-mail transacional, sem sessão Supabase),
-- mas escrita (insert/update/delete) só pra admin do workspace dono da pasta.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-assets',
  'workspace-assets',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists workspace_assets_select_public on storage.objects;
create policy workspace_assets_select_public
  on storage.objects for select
  to public
  using (bucket_id = 'workspace-assets');

drop policy if exists workspace_assets_insert_admin on storage.objects;
create policy workspace_assets_insert_admin
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'workspace-assets'
    and public.is_workspace_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists workspace_assets_update_admin on storage.objects;
create policy workspace_assets_update_admin
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workspace-assets'
    and public.is_workspace_admin(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'workspace-assets'
    and public.is_workspace_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists workspace_assets_delete_admin on storage.objects;
create policy workspace_assets_delete_admin
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workspace-assets'
    and public.is_workspace_admin(((storage.foldername(name))[1])::uuid)
  );
