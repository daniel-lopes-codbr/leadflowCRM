import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// `next` chega como query param de fora (link, bookmark, redirect encadeado,
// e-mail de confirmação). Só aceitamos caminho relativo de origem única —
// bloqueia `//evil.com`, `https://evil.com`, `/\evil.com` e o truque de
// userinfo (`@evil.com`) que faria `${origin}${next}` resolver pra outro
// host (open redirect).
export function isSafeNextPath(path: string | null): path is string {
  return (
    !!path &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    !path.includes("@")
  );
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Escapa valores dinâmicos antes de interpolar em HTML montado à mão
// (e-mails do Resend, respostas de rota que não passam pelo escaping
// automático do JSX) — evita XSS via campos como nome do workspace ou
// e-mail do convite, que não têm restrição de caracteres na validação.
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
