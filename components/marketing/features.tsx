import { BarChart3, Building2, History, KanbanSquare, UsersRound, Contact } from "lucide-react";

const features = [
  {
    icon: KanbanSquare,
    title: "Pipeline Kanban",
    description:
      "Arraste negócios entre as 6 etapas da venda, do primeiro contato ao fechamento, com persistência imediata.",
  },
  {
    icon: Contact,
    title: "Gestão de leads",
    description:
      "Centralize nome, contato, empresa e status de cada lead — com busca e filtros para achar o que importa rápido.",
  },
  {
    icon: History,
    title: "Timeline de atividades",
    description:
      "Ligações, e-mails, reuniões e notas registrados em ordem cronológica no perfil de cada lead.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de métricas",
    description:
      "Funil de vendas, valor total em aberto e taxa de conversão — sem precisar montar planilha nenhuma.",
  },
  {
    icon: Building2,
    title: "Múltiplos workspaces",
    description:
      "Atende mais de um cliente? Alterne entre workspaces isolados direto pela barra lateral.",
  },
  {
    icon: UsersRound,
    title: "Colaboração em equipe",
    description: "Convide vendedores por e-mail, defina papéis e acompanhe a operação toda.",
  },
] as const;

export function Features() {
  return (
    <section id="funcionalidades" className="bg-background py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Funcionalidades
          </span>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Tudo que um time comercial usa no dia a dia.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Nada além disso. O LeadFlow foi desenhado para ser tão simples quanto uma planilha — só
            que muito mais poderoso.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="hover:bg-secondary/50 group bg-background p-8 transition-colors"
            >
              <feature.icon
                className="h-6 w-6 text-primary transition-transform group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
