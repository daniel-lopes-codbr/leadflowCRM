# LeadFlow CRM

Briefing de projeto para o Claude Code. Para o detalhamento completo de requisitos, ver `.claude/documents/ProductPRD.md`.

## Visão geral

LeadFlow CRM é um SaaS B2B (modelo Freemium) para pequenas/médias empresas, freelancers e times de vendas. Centraliza histórico de clientes e funil de vendas em um Pipeline Kanban interativo, resolvendo a desorganização de planilhas/dados espalhados. Posicionamento: tão fácil quanto o Pipedrive, sem a complexidade do HubSpot.

## Stack tecnológica

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript 5
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **UX:** `@dnd-kit` (drag & drop do Kanban) + Recharts (gráficos do dashboard)
- **Backend/API:** Server Components e API Routes do Next.js (TypeScript)
- **Banco/Auth:** Supabase (PostgreSQL, Auth, Row Level Security, Storage)
- **Pagamentos:** Stripe (Checkout Session, Webhooks, Customer Portal)
- **E-mail transacional:** Resend
- **Deploy:** Vercel + Git/GitHub

## Convenções de pastas

Estrutura App Router idiomática, organizada por módulo de negócio:

```
app/
  (marketing)/            # landing page pública (Hero, Features, Preços, CTA)
  (auth)/                 # login, signup, onboarding (criação do primeiro workspace)
  (app)/[workspaceId]/    # área autenticada, sempre escopada por workspace
    dashboard/            # métricas, funil (Recharts), avisos de prazo
    leads/                # listagem + página de detalhes/timeline
    pipeline/             # Kanban (6 colunas fixas)
    settings/             # branding, membros, plano/billing
  api/                    # route handlers e webhooks (ex: stripe)
components/
  ui/                     # componentes shadcn/ui
  kanban/
  leads/
  dashboard/
lib/
  supabase/               # clients server/client, helpers de RLS
  stripe/
  resend/
types/
```

Regras:
- **Multi-tenant por design:** toda rota autenticada é namespaced por `workspaceId`; nunca confiar em filtro de tenant só no client — a query já deve estar protegida por RLS no Postgres.
- **Server Components por padrão**; usar Client Components só onde há interatividade real (Kanban com drag-and-drop, formulários).
- Um workspace = uma empresa/time. Um usuário Admin Solo pode pertencer a múltiplos workspaces (dropdown na sidebar para alternar).

## Identidade visual

O PRD não define paleta — esta é a direção adotada como ponto de partida (ajustável):

- **Cor primária:** Indigo/Blue (ex. `indigo-600` para ações primárias, CTAs, estados ativos).
- **Neutros:** escala `slate` para texto, bordas e backgrounds.
- **Cores semânticas do Kanban:** verde para "Fechado Ganho", vermelho/rose para "Fechado Perdido"; as demais 4 colunas usam tons neutros.
- **Base de componentes:** shadcn/ui (Radix + Tailwind), ícones Lucide.
- **Tom:** profissional, limpo, confiável — B2B sério sem ser burocrático. Evitar excesso de elementos visuais/complexidade de dashboard (contraste intencional com HubSpot).

## Regras de negócio críticas

- **RBAC:** três perfis — Admin (dono, gerencia plano/Stripe, workspace, membros), Membro (operação: leads, Kanban, atividades, escopado ao workspace), Admin Solo (múltiplos workspaces isolados, um por cliente).
- **Pipeline Kanban:** 6 colunas fixas nesta ordem — Novo Lead, Contato Realizado, Proposta Enviada, Negociação, Fechado Ganho, Fechado Perdido. Mudança de coluna via drag-and-drop persiste imediatamente no banco.
- **Planos (Stripe):** Free trava em 1 colaboradores / 25 leads (hard limit); Pro é ilimitado (R$ 49/mês). Limite deve ser enforced no backend, não só escondido na UI.
- **LGPD (restrição permanente de design):** exclusão total de dados de leads/workspace, exportação de dados em CSV/JSON, opt-out automático em e-mails do Resend.
- **Logs:** separar infraestrutura (erros 500, crashes — Vercel Logs) de auditoria de negócio (tabela `audit_logs` no Postgres, só para eventos críticos: criação/exclusão de workspace, upgrade/downgrade de plano, convites aceitos/removidos, exportação de dados).
