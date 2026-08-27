-- LeadFlow CRM — Horário no agendamento de follow-up (M23)
--
-- scheduled_at era `date` (só dia, sem hora) — motivado por um pedido real
-- do usuário: "ligar às 15h" não é a mesma coisa que "ligar hoje". Vira
-- timestamptz pra guardar o instante completo.
--
-- date::timestamptz interpreta meia-noite na timezone da sessão (UTC no
-- Supabase) — registros antigos continuam representando o mesmo dia, só
-- ganham 00:00:00Z implícito. Nenhum backfill necessário.
--
-- Idempotente: se a coluna já for timestamptz (migration já rodou), o ALTER
-- COLUMN TYPE para o mesmo tipo é um no-op seguro.

alter table public.activities
  alter column scheduled_at type timestamptz using scheduled_at::timestamptz;
