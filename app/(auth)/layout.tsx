import Link from "next/link";
import { Workflow } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grain bg-secondary/40 flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Workflow className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">LeadFlow</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-8 text-center text-xs text-muted-foreground">
        <p>
          Ao continuar, você concorda com os{" "}
          <Link href="/termos" className="underline underline-offset-2 hover:text-foreground">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline underline-offset-2 hover:text-foreground">
            Política de Privacidade
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
