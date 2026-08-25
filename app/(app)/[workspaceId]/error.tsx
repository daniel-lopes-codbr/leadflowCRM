"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const workspaceId = pathname.split("/").filter(Boolean)[0];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-foreground">Não foi possível carregar esta página</h1>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou volte para o dashboard.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => reset()}>
          Tentar novamente
        </Button>
        {workspaceId && (
          <Button asChild>
            <Link href={`/${workspaceId}/dashboard`}>Ir para o dashboard</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
