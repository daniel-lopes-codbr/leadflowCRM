import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          Pronto para tirar seu funil da planilha?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
          Crie sua conta em menos de dois minutos. Sem cartão de crédito.
        </p>
        <div className="mt-9 flex justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/signup">
              Criar minha conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
