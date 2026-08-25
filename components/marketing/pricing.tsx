import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    description: "Para começar a organizar seu funil sem custo.",
    cta: "Começar grátis",
    href: "/signup",
    highlighted: false,
    features: ["1 colaborador", "Até 25 leads", "Pipeline Kanban completo", "Dashboard básico"],
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/ mês",
    description: "Para times que já vivem de vender.",
    cta: "Assinar Pro",
    href: "/signup?plan=pro",
    highlighted: true,
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Tudo do plano Free",
      "Exportação de dados",
      "Suporte prioritário",
    ],
  },
] as const;

export function Pricing() {
  return (
    <section id="precos" className="bg-secondary/40 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Preços
          </span>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Simples assim: grátis ou Pro.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
            Comece sem custo. Faça upgrade quando o time crescer.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "shadow-primary/20 border-primary bg-slate-950 text-white shadow-xl"
                  : "border-border bg-background"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Mais popular
                </span>
              )}

              <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
              <p
                className={`mt-1 text-sm ${plan.highlighted ? "text-slate-300" : "text-muted-foreground"}`}
              >
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">{plan.price}</span>
                <span className={plan.highlighted ? "text-slate-400" : "text-muted-foreground"}>
                  {plan.period}
                </span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check
                      className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-indigo-400" : "text-primary"}`}
                    />
                    <span className={plan.highlighted ? "text-slate-200" : "text-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={`mt-8 w-full ${plan.highlighted ? "" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
