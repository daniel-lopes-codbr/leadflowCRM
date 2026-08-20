# PLAN.md — Roteiro de Execução: LeadFlow CRM

Roteiro de execução derivado de `ProductPRD.md` e `CLAUDE.md`. Estratégia: construir toda a **interface primeiro** (com dados mockados), e só depois **conectar o backend** (Supabase, Stripe, Resend) tela por tela já construída. Cada milestone é uma branch própria, com objetivo, entregas em checklist e uma mensagem de commit final sugerida.

---

## Fase 0 — Setup

### M0. Setup do projeto
**Branch:** `chore/project-setup`
**Objetivo:** Inicializar a base técnica do projeto — Next.js, TypeScript, Tailwind, shadcn/ui e a estrutura de pastas definida no `CLAUDE.md` — sem nenhuma lógica de negócio ainda.

**Entregas:**
- [ ] Inicializar Next.js 14 (App Router) + React 18 + TypeScript 5
- [ ] Configurar Tailwind CSS com tema (paleta indigo/slate do `CLAUDE.md`)
- [ ] Instalar e configurar shadcn/ui + Lucide Icons
- [ ] Configurar ESLint + Prettier
- [ ] Criar estrutura de pastas (`app/`, `components/`, `lib/`, `types/`) conforme `CLAUDE.md`
- [ ] Criar `.env.example` com placeholders (Supabase, Stripe, Resend)
- [ ] README com instruções de setup local

**Commit final:** `chore: setup inicial do projeto Next.js + Tailwind + shadcn/ui`

---

## Fase 1 — Interface (UI com dados mockados)

### M1. Design system base + Landing Page
**Branch:** `feature/landing-page-ui`
**Objetivo:** Construir os componentes base de UI e a landing page pública, 100% estática.

**Entregas:**
- [ ] Componentes base (botões, cards, badges de status) via shadcn/ui
- [ ] Header e Footer públicos
- [ ] Seção Hero
- [ ] Seção Funcionalidades
- [ ] Seção Planos/Preços (Free vs Pro)
- [ ] Seção Call-to-Action
- [ ] Banner de cookies (placeholder LGPD)
- [ ] Responsividade mobile/desktop

**Commit final:** `feat: landing page e design system base`

---

### M2. UI de Autenticação e Onboarding (mock)
**Branch:** `feature/auth-onboarding-ui`
**Objetivo:** Telas de login, cadastro e onboarding com validação client-side, sem Supabase — estado local/mock.

**Entregas:**
- [ ] Tela de Login (form + validação)
- [ ] Tela de Cadastro (form + validação)
- [ ] Fluxo de Onboarding: criação obrigatória do primeiro Workspace
- [ ] Estados de erro/loading mockados

**Commit final:** `feat: UI de autenticação e onboarding`

---

### M3. Shell da área autenticada
**Branch:** `feature/app-shell-ui`
**Objetivo:** Construir a casca da aplicação autenticada: sidebar, navbar e troca de workspace, com dados mockados.

**Entregas:**
- [ ] Sidebar com navegação (Dashboard, Leads, Pipeline, Settings)
- [ ] Navbar com usuário/avatar
- [ ] Dropdown de troca de Workspace (mock com múltiplos workspaces)
- [ ] Exibição do logo do workspace na sidebar (placeholder)
- [ ] Layout responsivo (sidebar colapsável em mobile)

**Commit final:** `feat: shell da aplicação autenticada (sidebar, navbar, workspace switcher)`

---

### M4. UI de Leads
**Branch:** `feature/leads-ui`
**Objetivo:** Construir listagem, busca/filtros, CRUD e página de detalhes de Lead, com dados mockados.

**Entregas:**
- [ ] Tabela de Leads com busca (texto) e filtros (Status, Responsável, Data de criação)
- [ ] Modal/formulário de criação e edição de Lead (Nome, E-mail, Telefone, Empresa, Cargo, Status)
- [ ] Página de detalhes do Lead (perfil consolidado)
- [ ] Componente de Timeline de atividades (mock, ordem cronológica reversa)

**Commit final:** `feat: UI de gestão de leads (listagem, CRUD, detalhes)`

---

### M5. UI do Pipeline Kanban
**Branch:** `feature/pipeline-kanban-ui`
**Objetivo:** Construir o Kanban de vendas com as 6 colunas fixas e drag-and-drop funcional em estado local (sem persistência real).

**Entregas:**
- [ ] Layout das 6 colunas fixas (Novo Lead, Contato Realizado, Proposta Enviada, Negociação, Fechado Ganho, Fechado Perdido)
- [ ] Card de Deal (Título, Valor estimado, Lead vinculado, Responsável, Prazo)
- [ ] Drag-and-drop entre colunas via `@dnd-kit` com atualização de estado local
- [ ] Modal de criação/edição de Deal

**Commit final:** `feat: UI do pipeline Kanban com drag-and-drop`

---

### M6. UI de Atividades + Dashboard de Métricas
**Branch:** `feature/dashboard-activities-ui`
**Objetivo:** Construir o registro de atividades e o Dashboard de métricas, tudo com dados mockados.

**Entregas:**
- [ ] Formulário de registro de atividade (Ligação, E-mail, Reunião, Nota)
- [ ] Cards resumo (Total de Leads, Negócios Abertos, Valor Total do Pipeline, Taxa de Conversão)
- [ ] Gráfico de funil de vendas (Recharts)
- [ ] Painel de negócios do usuário logado com prazo próximo

**Commit final:** `feat: UI de atividades e dashboard de métricas`

---

### M7. UI de Configurações
**Branch:** `feature/settings-ui`
**Objetivo:** Construir as telas de configurações — workspace/branding, membros e planos — mockadas.

**Entregas:**
- [ ] Tela de edição de Workspace (nome, upload de logo com preview local)
- [ ] Tela de gestão de membros (convidar, remover, listar)
- [ ] Tela de Planos (Free vs Pro) com indicador de uso/limite
- [ ] Tela de exportação e exclusão de dados (LGPD)

**Commit final:** `feat: UI de configurações (workspace, membros, planos, LGPD)`

---

## Fase 2 — Backend (conectando cada tela já construída)

### M8. Supabase: Schema e RLS
**Branch:** `feature/supabase-schema-rls`
**Objetivo:** Provisionar o Supabase, modelar o schema multi-tenant e configurar Row Level Security.

**Entregas:**
- [ ] Provisionar projeto Supabase + configurar clients (server/browser) em `lib/supabase/`
- [ ] Migrations: `workspaces`, `memberships`, `leads`, `deals`, `activities`, `audit_logs`
- [ ] Políticas de RLS por `workspace_id` em todas as tabelas
- [ ] Seed de dados de desenvolvimento

**Commit final:** `feat: schema do banco e RLS multi-tenant no Supabase`

---

### M9. Autenticação real e Onboarding
**Branch:** `feature/auth-backend`
**Objetivo:** Conectar as telas do M2 ao Supabase Auth, criar workspace real no onboarding e proteger rotas.

**Entregas:**
- [ ] Integração Supabase Auth (login, cadastro, sessão) nas telas do M2
- [ ] Middleware de proteção de rotas autenticadas por workspace
- [ ] Criação real de Workspace + membership Admin no onboarding
- [ ] Envio de convite de membro via Resend (conectando a tela de membros do M7)

**Commit final:** `feat: autenticação real e onboarding conectados ao Supabase`

---

### M10. Backend de Leads e Atividades
**Branch:** `feature/leads-activities-backend`
**Objetivo:** Conectar o CRUD de Leads (M4) e o registro de Atividades (M6) a Server Actions reais.

**Entregas:**
- [ ] Server Actions: criar/editar/excluir Lead
- [ ] Busca e filtros server-side
- [ ] Server Actions: registrar Atividade (timeline real)
- [ ] Enforce no backend do hard limit de leads do plano Free

**Commit final:** `feat: backend de leads e atividades conectado ao Supabase`

---

### M11. Backend do Pipeline Kanban
**Branch:** `feature/pipeline-backend`
**Objetivo:** Persistir os Deals e o drag-and-drop do Kanban (M5) no Supabase.

**Entregas:**
- [ ] Server Actions: criar/editar Deal
- [ ] Persistência imediata de mudança de status (coluna) via drag-and-drop
- [ ] Cálculo real de valor total do pipeline por workspace

**Commit final:** `feat: backend do pipeline Kanban conectado ao Supabase`

---

### M12. Dashboard com dados reais
**Branch:** `feature/dashboard-backend`
**Objetivo:** Substituir os dados mockados do Dashboard (M6) por queries reais.

**Entregas:**
- [ ] Queries de métricas (Total Leads, Negócios Abertos, Valor Pipeline, Taxa de Conversão)
- [ ] Dados reais do gráfico de funil (Recharts)
- [ ] Query de negócios com prazo próximo por usuário logado

**Commit final:** `feat: dashboard conectado a dados reais`

---

### M13. Branding e gestão de membros (backend)
**Branch:** `feature/workspace-branding-backend`
**Objetivo:** Implementar upload de logo real e conectar as telas de settings (M7) ao backend.

**Entregas:**
- [ ] Upload de logo para bucket `workspace-assets` (compressão client-side, validação PNG/JPG/SVG/WebP até 2MB)
- [ ] Logo refletido na Sidebar/Navbar e no cabeçalho dos e-mails transacionais (Resend)
- [ ] Backend real de convite/remoção de membros
- [ ] Enforce no backend do hard limit de colaboradores do plano Free

**Commit final:** `feat: branding, upload de logo e gestão de membros conectados ao backend`

---

### M14. Integração Stripe
**Branch:** `feature/stripe-billing`
**Objetivo:** Implementar o fluxo de monetização completo, conectando a tela de Planos (M7).

**Entregas:**
- [ ] Checkout Session para upgrade ao plano Pro
- [ ] Webhook de confirmação de pagamento → upgrade do workspace
- [ ] Customer Portal (cancelamento, troca de método de pagamento)
- [ ] Downgrade automático e reflexo dos limites do plano na UI

**Commit final:** `feat: integração completa de billing com Stripe`

---

### M15. LGPD e Audit Logs
**Branch:** `feature/lgpd-audit-logs`
**Objetivo:** Implementar os fluxos reais de conformidade LGPD e a tabela de auditoria de negócio.

**Entregas:**
- [ ] Fluxo de exclusão total de dados de lead/workspace (conectando a tela do M7)
- [ ] Exportação de dados em CSV/JSON
- [ ] Opt-out automático nos rodapés de e-mails (Resend)
- [ ] Registro em `audit_logs`: criação/exclusão de workspace, upgrade/downgrade de plano, convites aceitos/removidos, exportação de dados

**Commit final:** `feat: conformidade LGPD e logs de auditoria`

---

## Fase 3 — Fechamento

### M16. QA, testes e hardening de segurança
**Branch:** `chore/qa-security-hardening`
**Objetivo:** Revisar segurança e cobrir os fluxos críticos com testes antes do deploy.

**Entregas:**
- [ ] Revisão de isolamento de tenant via RLS (testes manuais/automatizados)
- [ ] Testes E2E dos fluxos críticos (onboarding, Kanban, billing)
- [ ] Revisão de acessibilidade básica
- [ ] Tratamento de erros e estados vazios/loading em todas as telas

**Commit final:** `test: hardening de segurança e testes end-to-end`

---

### M17. Deploy de produção (Vercel)
**Branch:** `chore/production-deploy`
**Objetivo:** Publicar o projeto em produção na Vercel com monitoramento básico.

**Entregas:**
- [ ] Projeto Vercel conectado ao repositório
- [ ] Variáveis de ambiente de produção (Supabase, Stripe, Resend)
- [ ] Configuração de domínio customizado
- [ ] Verificação de Vercel Logs para erros 500/crashes
- [ ] Smoke test em produção (signup → workspace → lead → deal → billing)

**Commit final:** `chore: deploy de produção na Vercel`
