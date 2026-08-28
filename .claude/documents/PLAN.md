# PLAN.md — Roteiro de Execução: LeadFlow CRM

Roteiro de execução derivado de `ProductPRD.md` e `CLAUDE.md`. Estratégia: construir toda a **interface primeiro** (com dados mockados), e só depois **conectar o backend** (Supabase, Stripe, Resend) tela por tela já construída. Cada milestone é uma branch própria, com objetivo, entregas em checklist e uma mensagem de commit final sugerida.

---

## Fase 0 — Setup

### M0. Setup do projeto
**Branch:** `chore/project-setup`
**Objetivo:** Inicializar a base técnica do projeto — Next.js, TypeScript, Tailwind, shadcn/ui e a estrutura de pastas definida no `CLAUDE.md` — sem nenhuma lógica de negócio ainda.

**Entregas:**
- [x] Inicializar Next.js 14 (App Router) + React 18 + TypeScript 5
- [x] Configurar Tailwind CSS com tema (paleta indigo/slate do `CLAUDE.md`)
- [x] Instalar e configurar shadcn/ui + Lucide Icons
- [x] Configurar ESLint + Prettier
- [x] Criar estrutura de pastas (`app/`, `components/`, `lib/`, `types/`) conforme `CLAUDE.md`
- [x] Criar `.env.example` com placeholders (Supabase, Stripe, Resend)
- [x] README com instruções de setup local

**Commit final:** `chore: setup inicial do projeto Next.js + Tailwind + shadcn/ui`

---

## Fase 1 — Interface (UI com dados mockados)

### M1. Design system base + Landing Page
**Branch:** `feature/landing-page-ui`
**Objetivo:** Construir os componentes base de UI e a landing page pública, 100% estática.

**Entregas:**
- [x] Componentes base (botões, cards, badges de status) via shadcn/ui
- [x] Header e Footer públicos
- [x] Seção Hero
- [x] Seção Funcionalidades
- [x] Seção Planos/Preços (Free vs Pro)
- [x] Seção Call-to-Action
- [x] Banner de cookies (placeholder LGPD)
- [x] Responsividade mobile/desktop

**Commit final:** `feat: landing page e design system base`

---

### M2. UI de Autenticação e Onboarding (mock)
**Branch:** `feature/auth-onboarding-ui`
**Objetivo:** Telas de login, cadastro e onboarding com validação client-side, sem Supabase — estado local/mock.

**Entregas:**
- [x] Tela de Login (form + validação)
- [x] Tela de Cadastro (form + validação)
- [x] Fluxo de Onboarding: criação obrigatória do primeiro Workspace
- [x] Estados de erro/loading mockados

**Commit final:** `feat: UI de autenticação e onboarding`

---

### M3. Shell da área autenticada
**Branch:** `feature/app-shell-ui`
**Objetivo:** Construir a casca da aplicação autenticada: sidebar, navbar e troca de workspace, com dados mockados.

**Entregas:**
- [x] Sidebar com navegação (Dashboard, Leads, Pipeline, Settings)
- [x] Navbar com usuário/avatar
- [x] Dropdown de troca de Workspace (mock com múltiplos workspaces)
- [x] Exibição do logo do workspace na sidebar (placeholder)
- [x] Layout responsivo (sidebar colapsável em mobile)

**Commit final:** `feat: shell da aplicação autenticada (sidebar, navbar, workspace switcher)`

---

### M4. UI de Leads
**Branch:** `feature/leads-ui`
**Objetivo:** Construir listagem, busca/filtros, CRUD e página de detalhes de Lead, com dados mockados.

**Entregas:**
- [x] Tabela de Leads com busca (texto) e filtros (Status, Responsável, Data de criação)
- [x] Modal/formulário de criação e edição de Lead (Nome, E-mail, Telefone, Empresa, Cargo, Status)
- [x] Página de detalhes do Lead (perfil consolidado)
- [x] Componente de Timeline de atividades (mock, ordem cronológica reversa)

**Commit final:** `feat: UI de gestão de leads (listagem, CRUD, detalhes)`

---

### M5. UI do Pipeline Kanban
**Branch:** `feature/pipeline-kanban-ui`
**Objetivo:** Construir o Kanban de vendas com as 6 colunas fixas e drag-and-drop funcional em estado local (sem persistência real).

**Entregas:**
- [x] Layout das 6 colunas fixas (Novo Lead, Contato Realizado, Proposta Enviada, Negociação, Fechado Ganho, Fechado Perdido)
- [x] Card de Deal (Título, Valor estimado, Lead vinculado, Responsável, Prazo)
- [x] Drag-and-drop entre colunas via `@dnd-kit` com atualização de estado local
- [x] Modal de criação/edição de Deal

**Commit final:** `feat: UI do pipeline Kanban com drag-and-drop`

---

### M6. UI de Atividades + Dashboard de Métricas
**Branch:** `feature/dashboard-activities-ui`
**Objetivo:** Construir o registro de atividades e o Dashboard de métricas, tudo com dados mockados.

**Entregas:**
- [x] Formulário de registro de atividade (Ligação, E-mail, Reunião, Nota) — construído no M4, na página de detalhes do lead
- [x] Cards resumo (Total de Leads, Negócios Abertos, Valor Total do Pipeline, Taxa de Conversão)
- [x] Gráfico de funil de vendas (Recharts)
- [x] Painel de negócios do usuário logado com prazo próximo

**Commit final:** `feat: UI de atividades e dashboard de métricas`

---

### M7. UI de Configurações
**Branch:** `feature/settings-ui`
**Objetivo:** Construir as telas de configurações — workspace/branding, membros e planos — mockadas.

**Entregas:**
- [x] Tela de edição de Workspace (nome, upload de logo com preview local)
- [x] Tela de gestão de membros (convidar, remover, listar)
- [x] Tela de Planos (Free vs Pro) com indicador de uso/limite
- [x] Tela de exportação e exclusão de dados (LGPD)

**Commit final:** `feat: UI de configurações (workspace, membros, planos, LGPD)`

---

## Fase 2 — Backend (conectando cada tela já construída)

### M8. Supabase: Schema e RLS
**Branch:** `feature/supabase-schema-rls`
**Objetivo:** Provisionar o Supabase, modelar o schema multi-tenant e configurar Row Level Security.

**Entregas:**
- [x] Provisionar projeto Supabase + configurar clients (server/browser) em `lib/supabase/`
- [x] Migrations: `workspaces`, `memberships`, `leads`, `deals`, `activities`, `audit_logs`
- [x] Políticas de RLS por `workspace_id` em todas as tabelas
- [x] Seed de dados de desenvolvimento (local, via `supabase db reset` — nunca contra o projeto hospedado)

**Commit final:** `feat: schema do banco e RLS multi-tenant no Supabase`

---

### M9. Autenticação real e Onboarding
**Branch:** `feature/auth-backend`
**Objetivo:** Conectar as telas do M2 ao Supabase Auth, criar workspace real no onboarding e proteger rotas.

**Entregas:**
- [x] Integração Supabase Auth (login, cadastro, sessão) nas telas do M2
- [x] Middleware de proteção de rotas autenticadas por workspace
- [x] Criação real de Workspace + membership Admin no onboarding
- [x] Envio de convite de membro via Resend (conectando a tela de membros do M7) — via tabela `invites` com token, para evitar auto-promoção em workspace alheio

**Commit final:** `feat: autenticação real e onboarding conectados ao Supabase`

---

### M10. Backend de Leads e Atividades
**Branch:** `feature/leads-activities-backend`
**Objetivo:** Conectar o CRUD de Leads (M4) e o registro de Atividades (M6) a Server Actions reais.

**Entregas:**
- [x] Server Actions: criar/editar/excluir Lead
- [x] Busca e filtros server-side
- [x] Server Actions: registrar Atividade (timeline real)
- [x] Enforce no backend do hard limit de leads do plano Free

**Commit final:** `feat: backend de leads e atividades conectado ao Supabase`

---

### M11. Backend do Pipeline Kanban
**Branch:** `feature/pipeline-backend`
**Objetivo:** Persistir os Deals e o drag-and-drop do Kanban (M5) no Supabase.

**Entregas:**
- [x] Server Actions: criar/editar Deal
- [x] Persistência imediata de mudança de status (coluna) via drag-and-drop
- [x] Cálculo real de valor total do pipeline por workspace

**Commit final:** `feat: backend do pipeline Kanban conectado ao Supabase`

---

### M12. Dashboard com dados reais
**Branch:** `feature/dashboard-backend`
**Objetivo:** Substituir os dados mockados do Dashboard (M6) por queries reais.

**Entregas:**
- [x] Queries de métricas (Total Leads, Negócios Abertos, Valor Pipeline, Taxa de Conversão)
- [x] Dados reais do gráfico de funil (Recharts)
- [x] Query de negócios com prazo próximo por usuário logado

**Commit final:** `feat: dashboard conectado a dados reais`

---

### M13. Branding e gestão de membros (backend)
**Branch:** `feature/workspace-branding-backend`
**Objetivo:** Implementar upload de logo real e conectar as telas de settings (M7) ao backend.

**Entregas:**
- [x] Upload de logo para bucket `workspace-assets` (compressão client-side, validação PNG/JPG/SVG/WebP até 2MB)
- [x] Logo refletido na Sidebar/Navbar e no cabeçalho dos e-mails transacionais (Resend)
- [x] Backend real de convite/remoção de membros
- [x] Enforce no backend do hard limit de colaboradores do plano Free

**Commit final:** `feat: branding, upload de logo e gestão de membros conectados ao backend`

---

### M14. Integração Stripe
**Branch:** `feature/stripe-billing`
**Objetivo:** Implementar o fluxo de monetização completo, conectando a tela de Planos (M7).

**Entregas:**
- [x] Checkout Session para upgrade ao plano Pro
- [x] Webhook de confirmação de pagamento → upgrade do workspace
- [x] Customer Portal (cancelamento, troca de método de pagamento)
- [x] Downgrade automático e reflexo dos limites do plano na UI

**Commit final:** `feat: integração completa de billing com Stripe`

---

### M15. LGPD e Audit Logs
**Branch:** `feature/lgpd-audit-logs`
**Objetivo:** Implementar os fluxos reais de conformidade LGPD e a tabela de auditoria de negócio.

**Entregas:**
- [x] Fluxo de exclusão total de dados de lead/workspace (conectando a tela do M7)
- [x] Exportação de dados em CSV/JSON
- [x] Opt-out automático nos rodapés de e-mails (Resend)
- [x] Registro em `audit_logs`: criação/exclusão de workspace, upgrade/downgrade de plano, convites aceitos/removidos, exportação de dados

**Commit final:** `feat: conformidade LGPD e logs de auditoria`

---

## Fase 3 — Fechamento

### M16. QA, testes e hardening de segurança
**Branch:** `chore/qa-security-hardening`
**Objetivo:** Revisar segurança e cobrir os fluxos críticos com testes antes do deploy.

**Entregas:**
- [x] Revisão de isolamento de tenant via RLS (testes manuais/automatizados)
- [x] Testes E2E dos fluxos críticos (onboarding, Kanban, billing)
- [x] Revisão de acessibilidade básica
- [x] Tratamento de erros e estados vazios/loading em todas as telas

**Commit final:** `test: hardening de segurança e testes end-to-end`

---

### M17. Deploy de produção (Vercel)
**Branch:** `chore/production-deploy`
**Objetivo:** Publicar o projeto em produção na Vercel com monitoramento básico.

**Entregas:**
- [x] Projeto Vercel conectado ao repositório (via GitHub App, escopado ao repo)
- [x] Variáveis de ambiente de produção (Supabase, Stripe, Resend)
- [ ] Configuração de domínio customizado — adiado por escolha do usuário; app roda no domínio padrão da Vercel (`leadflowcrm-lopes14.vercel.app`) por enquanto
- [x] Verificação de Vercel Logs para erros 500/crashes (nenhum erro de runtime na janela do deploy/smoke test)
- [x] Smoke test em produção (signup → workspace → lead → deal → billing) — todas as etapas confirmadas, dados descartáveis limpos após o teste

**Notas:**
- Stripe em modo Teste em produção por decisão explícita do usuário (a conta já hospeda outro produto live; live mode fica para quando o billing for lançado de verdade — vai exigir novo webhook endpoint + chaves live).
- Webhook de produção criado (`we_1U8Op9ALRdcL6ScKBxHKCVkT`) apontando para `/api/stripe/webhook`, gated por `metadata.workspace_id` — não interfere com o outro produto da conta.

**Commit final:** `chore: deploy de produção na Vercel`

---

## Roadmap pós-lançamento (benchmark competitivo)

Após o M17, foi feito um benchmark de mercado com 10 concorrentes (Agendor, RD Station CRM, PipeRun, Ploomes, Moskit CRM, Kommo/amoCRM, Nectar CRM, Pipedrive, HubSpot CRM, noCRM.io) pra identificar lacunas reais do LeadFlow frente ao setor. Critério de priorização: impacto no público-alvo (PME/freelancer brasileiro) ÷ esforço pra um dev solo — não é "ter tudo que os grandes têm". Só as prioridades altas viram milestone agora; o resto fica registrado como backlog considerado, para retomar quando fizer sentido.

### M18. Link direto para WhatsApp no lead
**Branch:** `feature/whatsapp-link`
**Objetivo:** Eliminar a fricção de copiar/colar o telefone do lead pra abrir uma conversa — não é integração de API (cara, burocrática, exige verificação de Business), é um link `wa.me` com o número já preenchido.

**Entregas:**
- [x] Botão/ícone de WhatsApp no card do lead (Kanban) e na página de detalhes do lead, abrindo `https://wa.me/<telefone>` em nova aba
- [x] Normalização do telefone armazenado (DDI+DDD) para montar o link corretamente — `lib/whatsapp.ts`
- [x] Tratamento de lead sem telefone válido (esconder o botão — `buildWhatsappLink` retorna `null`)
- [x] Validado: `tsc`, lint e build limpos; suíte E2E sem regressão; verificação end-to-end via Playwright confirmando href/aria-label/target corretos no card do Kanban

**Nota de implementação:** o link do WhatsApp no card do Kanban fica fora do `<button>` arrastável (elemento irmão, posicionado absolutamente) — colocar dentro geraria HTML inválido (elemento interativo aninhado) e conflito real com os listeners de pointer do `useDraggable`, que fariam o clique no link também disparar o drag/abrir o modal de edição do negócio.

**Commit final:** `feat: link direto para WhatsApp no lead`

---

### M19. Follow-up com lembrete (tarefas com data) + histórico de responsabilidade
**Branch:** `feature/lead-followups`
**Objetivo:** Gap mais citado em toda a pesquisa de mercado — hoje o LeadFlow só tem "Nota" manual sem data. Evolução da tabela `activities` já existente, não uma feature nova do zero.

**Escopo revisado (2026-08-26):** duas rodadas de revisão antes de começar a implementação:

1. Identificamos que o follow-up sozinho não resolve o cenário mais crítico de perda de histórico: se um vendedor sai da empresa e o lead/negócio é reatribuído, o próximo vendedor não tem como saber quem era o responsável antes nem o que já foi combinado, porque hoje a troca de `owner_id` em `leads`/`deals` acontece silenciosamente (confirmado no código: `updateLead`/`updateDeal` sobrescrevem `owner_id` sem deixar rastro nenhum).
2. Percebemos também que "campo de data" sozinho não é a mesma coisa que "lembrete de verdade". Hoje `activities.occurred_at` é literalmente "quando **aconteceu**" (registro retroativo) — não existe nenhuma forma de agendar uma ação futura, muito menos avisar o vendedor quando chegar a hora. Um painel passivo no Dashboard só ajuda quem lembra de abrir o CRM naquele dia. Por decisão do usuário, o lembrete precisa ser ativo: **e-mail no dia agendado**, via Resend (já configurado no projeto pro convite de membro) — não só um painel.

**Entregas:**
- [x] Migration: campos `scheduled_at`/`completed_at`/`canceled_at` em `activities` (`occurred_at` virou nullable) — `supabase/migrations/20260827000001_followups.sql`
- [x] Follow-up nunca é apagado de verdade — concluir ou cancelar são mudanças de status (`completeFollowUp`/`cancelFollowUp`), sempre visíveis na timeline
- [x] Reagendar cancela o antigo e cria um novo (`rescheduleFollowUp`), preservando o rastro
- [x] **Reatribuição de responsável vira atividade automática na timeline** — `lib/activities.ts` (`logOwnerChangeActivity`), chamado por `updateLead` e `updateDeal`
- [x] **Lembrete ativo por e-mail** — `app/api/cron/followup-reminders/route.ts`, agendado via `vercel.json` (`0 12 * * *` = 09h BRT), protegido por `CRON_SECRET`
- [x] Indicador visual de follow-up atrasado no card do Kanban (`hasOverdueFollowUp`)
- [x] Painel "Follow-ups de hoje e atrasados" no Dashboard, ao lado do "Prazos próximos" — `components/dashboard/upcoming-followups.tsx`
- [x] RLS: reaproveita as policies já existentes de `activities` (nenhuma mudança de RLS necessária, só colunas novas)
- [x] Validado: `tsc`, lint e build limpos; suíte E2E sem regressão; verificação end-to-end via Playwright cobrindo follow-up pendente/concluído/atrasado, indicador no Kanban e histórico de troca de responsável

**Commit final:** `feat: follow-up com lembrete por e-mail e histórico de responsabilidade em leads e negócios`

---

### M20. Upload de documentos e anexos
**Branch:** `feature/attachments`
**Objetivo:** Feature de entrada em 8 dos 10 concorrentes pesquisados — anexar propostas/contratos/comprovantes a leads e negócios. Mesmo padrão já usado no bucket `workspace-assets` (Supabase Storage, S3-compatible, upload/download em stream, RLS por workspace), não reinventar a arquitetura.

**Escopo revisado (2026-08-28):** o item "upload via signed URL direto do cliente" foi trocado por upload via Server Action (mesmo mecanismo já usado pra logo do workspace) depois de revisar o próprio código existente — a logo já sobe hoje através do servidor, e o Next.js/Vercel suporta corpo de requisição de até 100MB, então streamar um PDF/contrato de poucos MB pelo Server Action não tem o risco de lentidão que motivou a preocupação original (isso só existiria se o arquivo fosse pra uma coluna do Postgres, o que nunca foi cogitado). Implementar o fluxo client-direto-pro-Storage exigiria expor o client browser do Supabase pela primeira vez no projeto — complexidade adicional sem ganho real nesse estágio.

**Entregas:**
- [x] Migration: tabela `attachments` (lead_id, workspace_id, nome, tipo, tamanho, path no Storage, autor, criado_em) + RLS por workspace — `supabase/migrations/20260828000001_attachments.sql`
- [x] Bucket dedicado `lead-attachments`, **privado** (diferente do `workspace-assets`, que é público) — anexo de lead é dado de negócio do cliente, download exige signed URL gerada sob demanda
- [x] Upload via Server Action, streamando o arquivo direto pro Storage (sem passar por coluna de banco) — `app/(app)/[workspaceId]/leads/attachment-actions.ts`
- [x] Lista de anexos + download (signed URL, expira em 60s, força `Content-Disposition: attachment`) na página de detalhes do lead
- [x] Exclusão de anexo (remove do Storage e da tabela, com confirmação)
- [x] Limite de 10MB por arquivo e tipos aceitos (PDF, PNG/JPEG/WebP, Word, Excel) validados no client e no servidor (e reforçados pelo próprio bucket do Storage)
- [x] Validado: `tsc`, lint e build limpos; suíte E2E sem regressão; verificação end-to-end via Playwright cobrindo upload, download real (evento de download do navegador, nome de arquivo correto) e exclusão

**Commit final:** `feat: upload de documentos e anexos em leads e negócios`

---

### Backlog considerado (sem milestone agora)

Itens de prioridade média/baixa do benchmark, registrados pra não perder o contexto — decisão de quando (ou se) puxar cada um fica pro usuário, conforme uso real dos clientes:

- **Formulário público de captura de lead (web-to-lead)** — prioridade média; página pública que insere direto na tabela `leads` do workspace certo.
- **Sequência simples de follow-up automático** (ex.: sem atividade em N dias → lembrete automático) — prioridade média; depende do M19 estar validado primeiro.
- **Assinatura eletrônica** — prioridade baixa; mesmo concorrentes maduros (PipeRun, Ploomes) tratam como módulo pago à parte pela complexidade jurídica (ICP-Brasil). Quando fizer sentido, integrar com provedor terceiro (Clicksign/D4Sign/Autentique) em vez de construir do zero.
- **App mobile nativo** — prioridade baixa; nenhum concorrente pesquisado trata isso como diferencial decisivo de venda. Web responsivo resolve por enquanto.
- **API pública** — prioridade baixa; sem demanda real de integração de terceiros ainda.
- **Inbox multicanal unificado (WhatsApp/Instagram/SMS dentro do CRM, estilo Kommo)** — prioridade baixa; infraestrutura de mensageria em tempo real é projeto grande por si só, só reavaliar se o produto decidir competir nesse nicho especificamente.

---

### M21. Revisão de precificação e antiabuso do plano Free

**Objetivo:** Dois problemas identificados numa conversa de revisão pós-benchmark, sem relação direta com M18-M20: (1) hoje o Pro cobra valor fixo (R$49/mês) independente do número de usuários, contrariando o padrão unânime dos 10 concorrentes pesquisados (todos cobram por usuário) — provavelmente o maior ponto de alavancagem financeira identificado até agora; (2) o limite de 25 leads no Free é baixo demais pra deixar alguém experimentar valor real antes de decidir assinar, mas removê-lo sem nenhuma trava equivalente abre brecha pra abuso — usar o Free como um "Pro grátis" indefinidamente (inclusive via múltiplos e-mails/workspaces) e usar a exportação de dados como porta de saída depois de extrair todo o valor.

**Diferente do M18-M20: este milestone tem decisões de negócio e uma pendência jurídica em aberto, não é implementação pronta pra puxar direto.** Por pedido do usuário, os itens que não dependem de advogado/preço saem um de cada vez — implementa, testa, valida, sobe, só depois puxa o próximo.

**Feito (2026-08-27):**
- [x] Removido o limite fixo de 25 leads **totais** do plano Free e substituído por 25 **novos leads por mês** (reseta a cada mês calendário) — `lib/plans.ts` (`PLAN_LIMITS.free.leadsPerMonth`, `startOfCurrentMonthIso()`), aplicado em `createLead` (`leads/actions.ts`) e no widget de uso em Configurações (`settings/page.tsx` + `plans-panel.tsx`, agora "Novos leads este mês"). Trava a velocidade de quem tentaria usar o Free pra sempre como "Pro grátis" sem sufocar quem está testando de verdade. Validado via Playwright (26º lead do mês bloqueado, widget mostra 25/25) e suíte E2E completa sem regressão.

**Feito (2026-08-28):**
- [x] Mecanismo contra "farm" de contas grátis, em duas frentes (sem exigir cartão de crédito, sem bloquear ninguém automaticamente):
  - **Rate limit diário de signup** (além do de 60s já existente): `signupDailyRatelimit` em `app/(auth)/actions.ts`, 5 cadastros por IP a cada 24h — pega quem cria várias contas manualmente ao longo do dia, não só script em rajada.
  - **Detecção de domínio de e-mail reutilizado**: `countSiblingFreeWorkspaces` em `app/(auth)/onboarding/actions.ts` — ao criar um workspace, verifica quantos outros workspaces Free já têm admin com e-mail do mesmo domínio (ignorando provedores públicos como Gmail/Hotmail via `lib/email-domains.ts`); a partir de 3, enriquece o `audit_logs` já existente (`workspace.created`) com `flagged_domain_reuse`/`sibling_free_workspaces` pra revisão manual — não bloqueia a criação, só deixa rastro pro founder investigar.
  - Validado via Playwright: rate limit diário bloqueia após esgotar a cota (confirmado inclusive persistindo entre execuções de teste, prova de que é real no Redis); detecção de domínio confirmada criando 3 workspaces free com domínio compartilhado + um 4º via fluxo real de onboarding, checando o `audit_logs` resultante. Suíte E2E completa sem regressão.

Os dois itens que dependiam de decisão de negócio/jurídico (sem ETA) foram movidos pro **M24**, pra não deixar este milestone em aberto indefinidamente. M21 é considerado entregue com o escopo acima.

**Commit final:** um por item, conforme cada um foi decidido e implementado (não foi um commit único como M18-M20).

---

### M23. Follow-up no Pipeline + horário no agendamento

**Branch:** `feature/pipeline-followup-ux`
**Objetivo:** Duas lacunas de UX reais encontradas pelo usuário usando o próprio produto (M19 já em produção), sem relação com preço/negócio: (1) ao mover um negócio de coluna no Pipeline e clicar no card pra conferir, o modal de edição do negócio não tinha nenhum lugar pra registrar ou ver follow-ups do lead — só existia na página de detalhes do lead, obrigando a sair do Pipeline; (2) o agendamento de follow-up só tinha campo de data, sem horário — reflexo de `activities.scheduled_at` ser `date`, não `timestamptz`.

**Entregas:**
- [x] Migration: `scheduled_at` de `date` para `timestamptz` — `supabase/migrations/20260901000001_followup_time.sql`, idempotente, sem backfill necessário
- [x] Campo de horário (`type="time"`) somado ao de data em `FollowUpFormDialog` e `RescheduleFollowUpDialog`, combinados num `Date`/ISO antes de enviar ao servidor
- [x] `getFollowUpStatus` (`types/activity.ts`) passa a comparar instantes (`new Date(scheduledAt) < new Date()`) em vez de strings de data — corrige um caso que já seria tecnicamente errado antes (follow-up de hoje à noite não devia aparecer atrasado pela manhã)
- [x] Novo helper `lib/dates.ts` (`startOfUtcDayIso`), mesmo padrão de `startOfCurrentMonthIso()` em `lib/plans.ts` — usado onde a comparação de "hoje" ainda precisa de fronteira de dia (cron, dashboard)
- [x] Cron de lembrete (`app/api/cron/followup-reminders/route.ts`) ajustado pra range de timestamp em vez de igualdade de string de data, e o e-mail passa a mostrar o horário agendado
- [x] Seção "Follow-ups" dentro do `DealFormDialog` (modal aberto ao clicar num card do Kanban) — lista via `ActivityTimeline` (mesmo componente da página de lead) + botão "Agendar follow-up", reaproveitando as Server Actions já existentes (`createFollowUp`/`completeFollowUp`/`cancelFollowUp`/`rescheduleFollowUp`); some quando o negócio ainda não tem lead vinculado
- [x] Correção necessária em `KanbanBoard`: o modal de edição aberto agora se resincroniza com dados atualizados do servidor (`router.refresh()`), senão um follow-up criado ali dentro só apareceria depois de fechar e reabrir o modal
- [x] Validado: `tsc`, lint e build limpos; suíte E2E sem regressão; verificação end-to-end via Playwright cobrindo agendar/ver/concluir follow-up de dentro do Pipeline, com horário exibido corretamente

**Fora de escopo, por decisão explícita:** nenhum prompt automático pós-drag-and-drop oferecendo follow-up (o clique no card já resolve o fluxo descrito, sem inventar uma interação nova); sem mudança na cadência do e-mail de lembrete (continua 1x/dia); sem timezone picker (projeto segue assumindo fuso único implícito, mesmo precedente do M21).

**Commit final:** `feat: follow-up no modal do Pipeline e horário no agendamento`

**Correção pós-lançamento (2026-08-27):** com dados reais, a seção de follow-ups no modal do Pipeline estourava a altura conforme os follow-ups se acumulavam num negócio (visto num print do usuário). Em vez de resolver com opinião própria (o usuário citou paginação como palpite dele mesmo, mas pediu explicitamente pra pesquisar como o mercado resolve isso antes), pesquisei HubSpot, Salesforce, Pipedrive e Agendor: os 4, de forma independente, separam pendente/acionável (compacto, sempre visível) de histórico/concluído (aba ou seção separada, escondida por padrão) — nenhum usa paginação numerada. `components/leads/activity-timeline.tsx` (compartilhado entre a página do lead e o modal do Pipeline) ganhou abas "Pendentes"/"Histórico" via `Tabs` do shadcn/ui (já era dependência do projeto) com contador em cada aba, e cada lista tem altura máxima com scroll interno — resolve o estouro independentemente de quantos follow-ups existam. Nenhuma Server Action ou tipo mudou, refactor isolado de apresentação. Validado via Playwright (6 pendentes forçando scroll + 2 no histórico, contadores corretos, botões de ação só aparecem em pendentes) e suíte E2E completa sem regressão.

**Correção estrutural pós-lançamento (2026-08-27):** mesmo com as abas, o modal inteiro (campos do negócio + Follow-ups) continuava espremido num popup de 512px — o problema de fundo não era só a lista, era o negócio inteiro não ter um espaço de verdade, diferente do lead (que já tem página própria). Pesquisei de novo antes de decidir: Pipedrive abre a **Detail View** (dedicada, com sidebar, não modal) ao clicar no card; HubSpot usa o mesmo layout de página cheia de 3 colunas pra todo "record" (negócio, contato, empresa); Salesforce e Agendor, idem — nenhum dos 4 usa um modal pequeno como superfície principal de um negócio com histórico. Achado extra no código: `deals.lead_id` é FK não-única (um lead pode ter vários negócios ao longo do tempo) e não existia nenhuma URL própria pra negócio nenhum — o link de "Prazos próximos" no Dashboard só apontava pro board inteiro por falta de endereço.
- [x] Nova rota `app/(app)/[workspaceId]/pipeline/[dealId]/page.tsx` + `components/kanban/deal-detail.tsx`, espelhando o layout 2 colunas já comprovado em `leads/[leadId]` — dados do negócio à esquerda, Follow-ups (Pendentes/Histórico) em altura de página real à direita
- [x] `DealFormDialog` volta a ser só o formulário de campos (perdeu a seção de Follow-ups, que mudou de casa) — segue servindo pra criar negócio no board e, agora, editar campos a partir de um botão "Editar" na página do negócio
- [x] Clique no card do Kanban passa a navegar pra `/pipeline/[dealId]` em vez de abrir modal; drag-and-drop continua idêntico (`updateDealStatus` inline, sem navegar)
- [x] Link de "Prazos próximos" no Dashboard passa a apontar pro negócio específico
- [x] Validado: `tsc`, lint e build limpos; suíte E2E completa sem regressão (só o flake pré-existente do drag-and-drop); Playwright cobrindo navegação pelo card, agendamento de follow-up na página nova, edição de campos sem a seção de follow-ups no modal, e o link do Dashboard apontando pro negócio certo

**Sete ajustes de UX pós-uso real (2026-08-28), reportados por um usuário final testando o app, todos validados com concorrentes antes de implementar:**
- [x] Removido o campo "Data" de "Registrar atividade" — causava um bug de fuso (o `datetime-local` sem timezone era reinterpretado pelo runtime do servidor, salvando a hora errada); `occurred_at` agora é sempre `now()` no servidor, sem input do usuário
- [x] Nomenclatura alinhada ao padrão de mercado (confirmado com o usuário): "Registrar atividade" continua igual; "Agendar follow-up" → **"Agendar tarefa"** em toda a UI (HubSpot/Salesforce usam "Task" pra ação futura, "Log Activity" pro registro passado — o oposto da sugestão original do usuário, que ele confirmou corrigir)
- [x] Botão **"Criar negócio"** na página do lead, com o lead já travado no formulário — atalho que HubSpot ("+ Add" no card de Deals do contato), Pipedrive ("Add new deal" na página da pessoa) e Salesforce ("Convert") também oferecem; Lead/Deal continuam objetos separados (confirmado que isso é o padrão em todo concorrente pesquisado, não um defeito do LeadFlow) — só faltava o atalho de criação rápida
- [x] Página do negócio agora mostra também notas/ligações avulsas registradas no lead (bug: a query filtrava só tarefas agendadas) — igualada à query da página do lead, mesmo padrão de histórico completo que HubSpot/Pipedrive mostram no registro do negócio
- [x] `revalidatePath` do padrão de rota dinâmica (`/pipeline/[dealId]`, `'page'`) adicionado onde atividades/tarefas de um lead são alteradas — garante que a página do negócio nunca fique com dado desatualizado
- [x] Reagendar virou **"Editar tarefa"** completo (tipo, descrição, data e hora, não só data) — mesmo mecanismo de sempre (cancela a antiga, cria uma nova, preserva o histórico)
- [x] **Sino de notificações** no navbar com a contagem de tarefas atrasadas do usuário logado — padrão documentado explicitamente pelo HubSpot ("red badge on the bell") — dropdown lista cada uma com link direto pro lead
- [x] Validado: `tsc`, lint e build limpos; suíte E2E completa sem regressão (só o flake pré-existente do drag-and-drop); Playwright cobrindo os 7 pontos de ponta a ponta, incluindo o histórico sincronizado entre lead e negócio sem reload manual

---

### M24. Billing por usuário e revisão de exportação (herdado do M21)

**Objetivo:** Os dois itens do M21 original que dependiam de decisão externa (preço, jurídico) sem ETA — separados pra não bloquear o M21 indefinidamente.

**Pendente:**
o- [ ] Migrar cobrança do Pro de valor fixo para cobrança por usuário: novo Price no Stripe com `billing_scheme: per_unit`, checkout mandando a quantidade real de membros (em vez de `quantity: 1` fixo hoje), e sincronização da quantidade da assinatura toda vez que um convite é aceito ou um membro é removido (Stripe cuida do rateio proporcional automaticamente via `stripe.subscriptions.update`)

**Commit final:** um por item, conforme cada um é decidido e implementado — mesmo espírito do M21.

---

### M22. Termos de Uso e Política de Privacidade

**Branch:** `docs/legal-pages`
**Objetivo:** As rotas `/termos` e `/privacidade` já eram linkadas no rodapé do site e no fluxo de login/cadastro, mas retornavam 404 — não existia conteúdo nenhum. Motivado por uma pergunta direta do usuário: "se eu precisar encerrar o projeto, sou obrigado a manter o serviço rodando pra sempre pra quem está no plano Free?" A resposta é não, mas **só se isso estiver escrito nos Termos de Uso** — sem cláusula nenhuma, não existe esse direito reservado por escrito.

**Decisão explícita do usuário:** implementar o conteúdo agora mesmo sem revisão jurídica prévia — "se deixar sem cláusula é pior do que ter a cláusula com brechas". Ambas as páginas têm um aviso visível de "rascunho pendente de revisão jurídica" no topo, e usam placeholders (`[A PREENCHER]`) para dados que só o usuário tem (razão social, CNPJ, endereço, foro, e-mail de contato/DPO) — **não devem ser publicadas como texto final sem revisão de advogado especializado em LGPD/direito digital, nem sem preencher os placeholders**.

**Entregas:**
- [x] Página `/termos` com cláusula explícita de modificação/suspensão/descontinuação do serviço (aviso prévio de 30 dias, direito de exportar dados antes do encerramento, exclusão definitiva depois — reaproveitando as funcionalidades de export/exclusão já existentes), cobrança/cancelamento, uso aceitável, limitação de responsabilidade, propriedade intelectual, foro
- [x] Página `/privacidade` alinhada à LGPD: distinção entre LeadFlow como controlador (dados de conta) e operador (dados de leads inseridos pelo cliente), dados coletados, base legal, subprocessadores (Supabase, Stripe, Resend, Vercel), direitos do titular, retenção/exclusão, segurança, cookies
- [x] Aviso de "rascunho pendente de revisão jurídica" visível em ambas as páginas
- [x] Validado: `tsc`, lint e build limpos; rotas retornam 200 (antes retornavam 404); suíte E2E sem regressão

**Pendências pós-implementação (não bloqueiam o merge, mas bloqueiam considerar o documento "final"):**
- [ ] Preencher os placeholders (`[RAZÃO SOCIAL A PREENCHER]`, `[CNPJ A PREENCHER]`, `[ENDEREÇO A PREENCHER]`, `[CIDADE/COMARCA A PREENCHER]`, e-mails de contato/DPO)
- [ ] Enviar para revisão de advogado especializado em LGPD/direito digital antes de tratar como texto definitivo

**Commit final:** `feat: adiciona páginas de Termos de Uso e Política de Privacidade`
