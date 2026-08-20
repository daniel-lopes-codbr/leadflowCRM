import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const dealCards = [
  {
    stage: "Negociação",
    company: "Estúdio Vértice",
    value: "R$ 18.400",
    owner: "AM",
    rot: "-6deg",
    top: "4%",
    left: "6%",
    delay: "0.5s",
  },
  {
    stage: "Fechado Ganho",
    company: "Grão Torrefação",
    value: "R$ 7.200",
    owner: "JP",
    rot: "4deg",
    top: "34%",
    left: "46%",
    delay: "0.7s",
  },
  {
    stage: "Proposta Enviada",
    company: "Nortis Engenharia",
    value: "R$ 42.000",
    owner: "CF",
    rot: "-3deg",
    top: "58%",
    left: "10%",
    delay: "0.9s",
  },
] as const;

export function Hero() {
  return (
    <section className="bg-grain relative overflow-hidden bg-slate-950 pb-28 pt-20 sm:pt-28">
      <div
        aria-hidden
        className="bg-primary/30 pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-[120px]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div
            className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200"
            style={{ animationDelay: "0.05s" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Feito para times que vendem todo dia
          </div>

          <h1
            className="animate-fade-up font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl"
            style={{ animationDelay: "0.15s" }}
          >
            Seu funil de vendas, <em className="not-italic text-indigo-400">organizado</em> de
            verdade.
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-slate-300"
            style={{ animationDelay: "0.25s" }}
          >
            Troque as planilhas por um Kanban visual, histórico completo de cada lead e métricas em
            tempo real. A simplicidade do papel, com o poder de um CRM.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "0.35s" }}
          >
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/signup">
                Começar grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/15 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#funcionalidades">Ver funcionalidades</a>
            </Button>
          </div>

          <p
            className="animate-fade-up mt-8 text-sm text-slate-400"
            style={{ animationDelay: "0.45s" }}
          >
            Grátis para 1 colaborador e 25 leads · sem cartão de crédito
          </p>
        </div>

        <div className="relative hidden h-[26rem] lg:block" aria-hidden>
          {dealCards.map((deal) => (
            <div
              key={deal.company}
              className="animate-fade-up animate-float-slow absolute w-64 rounded-xl border border-white/10 bg-white p-4 shadow-2xl shadow-black/40"
              style={
                {
                  top: deal.top,
                  left: deal.left,
                  "--rot": deal.rot,
                  transform: `rotate(${deal.rot})`,
                  animationDelay: deal.delay,
                } as React.CSSProperties
              }
            >
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                {deal.stage}
              </span>
              <p className="mt-3 font-display text-base font-semibold text-slate-900">
                {deal.company}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">{deal.value}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                  {deal.owner}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
