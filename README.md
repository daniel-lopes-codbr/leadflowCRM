# LeadFlow CRM

CRM SaaS B2B com Pipeline Kanban, multi-workspace e billing via Stripe. Veja `CLAUDE.md` para o briefing técnico completo, `.claude/documents/ProductPRD.md` para o PRD e `.claude/documents/PLAN.md` para o roteiro de execução por milestones.

## Stack

Next.js 14 (App Router) · TypeScript 5 · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, RLS, Storage) · Stripe · Resend

## Setup local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de variáveis de ambiente e preencha com suas credenciais (Supabase, Stripe, Resend):

   ```bash
   cp .env.example .env
   ```

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — inicia o build de produção
- `npm run lint` — roda o ESLint
