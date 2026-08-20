# Product Requirements Document (PRD) — LeadFlow CRM

## 1. Visão Geral do Produto
O **LeadFlow CRM** é uma plataforma SaaS B2B projetada para pequenas e médias empresas, freelancers e times de vendas. O sistema resolve o problema da desorganização comercial (uso de planilhas e dados espalhados) centralizando o histórico de clientes e o funil de vendas em um Pipeline Kanban interativo. 

* **Objetivo:** Fornecer uma ferramenta visual, intuitiva e acessível (modelo Freemium), inspirada na facilidade de uso do Pipedrive e simplificando o ecossistema robusto (porém complexo) do HubSpot.

---

## 2. Personas e Níveis de Acesso (RBAC)

| Perfil | Descrição | Permissões |
| :--- | :--- | :--- |
| **Admin (Dono/Empreendedor)** | Criador da conta e dono da assinatura. | Acesso total. Gerencia o plano (Stripe), edita o Workspace (upload de logo), convida/remove membros e vê todos os dados. |
| **Membro (Vendedor)** | Profissional focado na operação. | Cadastra leads, move cards no Kanban, registra atividades. Acesso limitado ao workspace em que foi convidado. |
| **Admin Solo (Consultor/Freelancer)**| Atende múltiplos clientes de forma isolada. | Cria e alterna entre múltiplos Workspaces (um para cada cliente) pelo dropdown da Sidebar. |

---

## 3. Escopo Funcional e Regras de Negócio

### 3.1. Landing Page e Autenticação
* **Landing Page:** Página pública construída estaticamente com seções: Hero, Funcionalidades, Planos/Preços e Call-to-Action (CTA).
* **Onboarding:** Fluxo de criação de conta seguido da criação obrigatória do primeiro Workspace.
* **Autenticação:** Login e senha gerenciados pelo Supabase Auth.

### 3.2. Multi-empresa (Workspaces) e Customização
* **Estrutura:** 1 Empresa/Time = 1 Workspace.
* **Branding:** Upload de logotipo da empresa (Formatos: PNG/JPG/SVG/WebP, Tamanho máximo: 2MB, compressão client-side). Armazenado no Supabase Storage (bucket `workspace-assets`).
* **UI:** O logo substitui o ícone padrão na Sidebar/Navbar e é injetado no cabeçalho dos e-mails transacionais.
* **Colaboração:** Convite de membros via e-mail (disparado via Resend).
* **Navegação:** Dropdown para alternar entre Workspaces (se o usuário pertencer a mais de um).

### 3.3. Gestão de Leads e Contatos (CRUD)
* **Campos Obrigatórios/Opcionais:** Nome, E-mail, Telefone, Empresa, Cargo e Status.
* **Listagem:** Tabela com suporte a Busca (texto) e Filtros (Status, Responsável, Data de criação).
* **Página de Detalhes do Lead:** Visualização do perfil consolidado e renderização da Timeline de Atividades.

### 3.4. Pipeline Kanban de Vendas
* **Colunas Fixas (6 Etapas):**
  1. Novo Lead
  2. Contato Realizado
  3. Proposta Enviada
  4. Negociação
  5. Fechado Ganho
  6. Fechado Perdido
* **Card de Negócio (Deal):** Deve conter Título, Valor estimado (R$), Nome do Lead vinculado, Responsável e Prazo (Deadline).
* **Interatividade:** Drag-and-drop (usando `@dnd-kit`) entre colunas com persistência imediata de status no banco de dados.

### 3.5. Registro de Atividades (Timeline)
* **Tipos de Ação:** Ligação, E-mail, Reunião, Nota.
* **Campos do Registro:** Autor (quem registrou), Descrição (texto rico/área), Data da interação.
* **Visualização:** Exibição em ordem cronológica reversa na página de detalhes do Lead.

### 3.6. Dashboard de Métricas
* **Cards Resumo:** Total de Leads, Negócios Abertos, Valor Total do Pipeline (R$), Taxa de Conversão.
* **Gráficos:** Funil de vendas renderizado utilizando a biblioteca Recharts.
* **Avisos:** Painel de negócios pertencentes ao usuário logado que estão com prazo (deadline) próximo.

### 3.7. Monetização e Planos (Stripe)
* **Plano Free:** Limite travado (Hard limit) em 2 colaboradores e 50 leads.
* **Plano Pro:** Colaboradores e leads ilimitados (R$ 49/mês).
* **Integração:** Checkout Session via Stripe, provisionamento ativado via Webhooks e gerenciamento de faturas/cancelamentos via Customer Portal.

---

## 4. Requisitos Não Funcionais (Segurança, LGPD e Logs)

### 4.1. Conformidade LGPD (Privacy by Design)
* **Transparência:** Termos de Uso e Política de Privacidade na Landing Page + Banner granular de cookies.
* **Contratos:** DPA com operadores de dados (Supabase, Stripe, Resend).
* **Direitos do Titular:** 
  * Fluxo para exclusão total de dados de leads e encerramento definitivo do Workspace.
  * Botão para exportação de dados em formato estruturado (CSV/JSON).
  * Mecanismo de Opt-out (unsubscribe) automático nos rodapés dos e-mails via Resend.

### 4.2. Segurança e Arquitetura de Dados
* **Isolamento de Tenants:** O banco de dados deve utilizar ativamente **Row Level Security (RLS)** do PostgreSQL, garantindo que queries não vazem dados de um `workspace_id` para outro.
* **Criptografia:** Trânsito 100% via HTTPS/TLS e dados em repouso no Supabase.

### 4.3. Observabilidade e Logs (Estratégia Equilibrada)
* **Logs de Infraestrutura (Performance e Erros):** Erros 500, crashes de API e falhas de Server Actions não devem onerar o banco. Serão capturados e avaliados via Vercel Logs (com futura evolução para Sentry no client-side).
* **Logs de Negócio/Auditoria (Tabela `audit_logs` no PostgreSQL):** Registro exclusivo de eventos corporativos críticos para análise no Admin:
  * Exclusão/Criação de Workspaces.
  * Upgrade/Downgrade de planos (Stripe).
  * Convites aceitos/removidos.
  * Exportação de dados de Leads.

---

## 5. Stack Tecnológica
* **Frontend:** Next.js 14 (App Router) + React 18
* **Estilização & UI:** Tailwind CSS + shadcn/ui + Lucide Icons
* **Funcionalidades UX:** `@dnd-kit` (Drag & drop) + `Recharts` (Gráficos)
* **Backend & API:** Next.js Server Components & API Routes (TypeScript 5)
* **Banco de Dados & Auth:** Supabase (PostgreSQL, Auth, RLS, Storage)
* **Pagamentos:** Stripe (Checkout, Webhooks)
* **Comunicação:** Resend (E-mails transacionais)
* **Infraestrutura/Deploy:** Vercel (Hosting frontend/API) + Git/GitHub (Versionamento)
* **Ferramental Dev:** Cursor IDE + Claude Code CLI (Terminal)