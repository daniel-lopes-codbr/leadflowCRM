-- LeadFlow CRM — Follow-up com lembrete + histórico de troca de responsável (M19)
--
-- Follow-up é uma extensão da própria tabela activities (não uma tabela
-- nova): quando scheduled_at é preenchido, a linha representa uma ação
-- agendada pro futuro em vez de um registro retroativo do que já aconteceu.
-- occurred_at vira nullable justamente por isso — só é preenchido quando o
-- follow-up é concluído (ou já nasce preenchido, como hoje, pra atividades
-- comuns tipo Nota/Ligação/E-mail/Reunião).
--
-- Follow-up nunca é apagado de verdade: completed_at/canceled_at fecham o
-- registro sem removê-lo, preservando o rastro mesmo que o responsável do
-- lead mude depois. Reagendar cancela o antigo e cria um novo, em vez de
-- sobrescrever a data silenciosamente.
--
-- Idempotente de propósito, na linha das outras migrations deste projeto.

alter type public.activity_type add value if not exists 'Responsável';

alter table public.activities
  alter column occurred_at drop not null,
  add column if not exists scheduled_at date,
  add column if not exists completed_at timestamptz,
  add column if not exists canceled_at timestamptz;

alter table public.activities drop constraint if exists activities_occurred_or_scheduled_check;
alter table public.activities
  add constraint activities_occurred_or_scheduled_check
  check (occurred_at is not null or scheduled_at is not null);

-- Índice parcial: só follow-ups ainda em aberto interessam pro painel do
-- Dashboard e pro job diário de lembrete — não vale indexar o histórico
-- inteiro pra essa consulta.
create index if not exists activities_pending_followups_idx
  on public.activities(workspace_id, scheduled_at)
  where scheduled_at is not null and completed_at is null and canceled_at is null;
