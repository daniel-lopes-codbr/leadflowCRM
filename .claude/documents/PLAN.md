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
- [ ] Botão/ícone de WhatsApp no card do lead (Kanban) e na página de detalhes do lead, abrindo `https://wa.me/<telefone>` em nova aba
- [ ] Normalização do telefone armazenado (DDI+DDD) para montar o link corretamente
- [ ] Tratamento de lead sem telefone válido (esconder ou desabilitar o botão)

**Commit final:** `feat: link direto para WhatsApp no lead`

---

### M19. Follow-up com lembrete (tarefas com data)
**Branch:** `feature/lead-followups`
**Objetivo:** Gap mais citado em toda a pesquisa de mercado — hoje o LeadFlow só tem "Nota" manual sem data. Evolução da tabela `activities` já existente, não uma feature nova do zero.

**Entregas:**
- [ ] Migration: campos de data prevista e conclusão nas atividades (ou tabela dedicada de tarefas vinculada a lead/negócio)
- [ ] Indicador visual de follow-up atrasado no card do lead/negócio
- [ ] Painel "Follow-ups de hoje/atrasados" no Dashboard, ao lado do já existente "Prazos próximos"
- [ ] Marcar follow-up como concluído (com timestamp)
- [ ] RLS: mesma regra de isolamento por workspace já usada em `activities`

**Commit final:** `feat: follow-up com lembrete em leads e negócios`

---

### M20. Upload de documentos e anexos
**Branch:** `feature/attachments`
**Objetivo:** Feature de entrada em 8 dos 10 concorrentes pesquisados — anexar propostas/contratos/comprovantes a leads e negócios. Mesmo padrão já usado no bucket `workspace-assets` (Supabase Storage, S3-compatible, upload/download em stream, RLS por workspace), não reinventar a arquitetura.

**Entregas:**
- [ ] Migration: tabela `attachments` (lead_id/deal_id, workspace_id, nome, tipo, tamanho, path no Storage, autor, criado_em) + RLS por workspace
- [ ] Bucket dedicado (ou pasta isolada por workspace num bucket existente) com policy de acesso restrita a membros do workspace
- [ ] Upload via signed URL direto do cliente pro Storage (sem o Next.js fazer proxy do arquivo inteiro)
- [ ] Lista de anexos + download na página de detalhes do lead/negócio
- [ ] Exclusão de anexo (remove do Storage e da tabela)
- [ ] Limite de tamanho por arquivo e tipos aceitos, validados no client e no servidor

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
