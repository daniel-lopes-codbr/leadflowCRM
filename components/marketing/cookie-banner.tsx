"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "leadflow-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function respond(value: "accepted" | "rejected") {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="bg-background/95 fixed inset-x-0 bottom-0 z-50 border-t border-border p-4 backdrop-blur-md sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Usamos cookies essenciais e de análise para melhorar sua experiência, em conformidade
            com a LGPD. Você pode aceitar ou rejeitar os cookies não essenciais a qualquer momento.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => respond("rejected")}>
            Rejeitar
          </Button>
          <Button size="sm" onClick={() => respond("accepted")}>
            Aceitar cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
