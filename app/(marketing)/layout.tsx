import { Archivo, Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} ${archivo.variable} font-body`}>{children}</div>;
}
