-- LeadFlow CRM — LGPD e auditoria (M15)

-- audit_logs precisa sobreviver à exclusão do workspace que documenta —
-- senão o próprio registro de "workspace.deleted" seria apagado pelo
-- cascade junto com o workspace, perdendo o rastro de auditoria que
-- deveria justamente registrar essa exclusão.
alter table public.audit_logs drop constraint if exists audit_logs_workspace_id_fkey;
alter table public.audit_logs
  add constraint audit_logs_workspace_id_fkey
  foreign key (workspace_id) references public.workspaces(id) on delete set null;

-- Completa o rastro convite -> aceite -> membership (CLAUDE.md pede
-- "convites aceitos/removidos" como evento crítico; só "removidos" tinha
-- um valor de enum até agora).
alter type public.audit_event_type add value if not exists 'member.joined';

-- Lista de supressão de e-mail transacional (LGPD: opt-out automático).
-- Checada pelo backend antes de qualquer envio via Resend. Sem policy de
-- select/insert pra authenticated de propósito — só a service_role
-- (Server Actions/Route Handlers de confiança) acessa.
create table if not exists public.email_opt_outs (
  email text primary key,
  opted_out_at timestamptz not null default now()
);

alter table public.email_opt_outs enable row level security;
