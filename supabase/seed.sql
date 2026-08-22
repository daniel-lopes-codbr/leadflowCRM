-- Seed de desenvolvimento — LOCAL APENAS.
--
-- Este arquivo roda automaticamente com `supabase db reset` (stack local via
-- Docker, iniciada com `supabase start`). Ele insere linhas diretamente em
-- `auth.users`, o que só é seguro contra o Postgres local efêmero do CLI.
--
-- NUNCA rode este arquivo contra o projeto hospedado (dashboard SQL editor,
-- `supabase db push`, etc.) — ele criaria um usuário de autenticação falso
-- no seu projeto real.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'ana@leadflow.dev',
  crypt('senha123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{"name":"Ana Martins"}',
  false, false
);

insert into public.workspaces (id, name, plan) values
  ('22222222-2222-2222-2222-222222222222', 'Estúdio Vértice', 'free');

insert into public.memberships (workspace_id, user_id, role) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin');

insert into public.leads (id, workspace_id, name, email, phone, company, role, status, owner_id) values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222',
   'Rafael Souza', 'rafael@vertice.com.br', '(11) 98220-4471', 'Estúdio Vértice', 'Sócio-diretor',
   'Negociação', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222',
   'Beatriz Lima', 'beatriz@graotorrefacao.com.br', '(21) 97711-2290', 'Grão Torrefação', 'Compras',
   'Fechado Ganho', '11111111-1111-1111-1111-111111111111');

insert into public.deals (workspace_id, lead_id, title, value, status, owner_id, deadline) values
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331',
   'Contrato anual Vértice', 18400, 'Negociação', '11111111-1111-1111-1111-111111111111', '2026-09-05'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332',
   'Plano Pro - Torrefação', 7200, 'Fechado Ganho', '11111111-1111-1111-1111-111111111111', '2026-07-01');

insert into public.activities (workspace_id, lead_id, type, description, author_id) values
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331',
   'Ligação', 'Alinhamos escopo inicial e enviei o catálogo de planos por e-mail.',
   '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331',
   'Reunião', 'Demonstração do produto com os dois sócios. Boa receptividade.',
   '11111111-1111-1111-1111-111111111111');
