"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const onboardingSchema = z.object({
  workspaceName: z.string().min(2, "Dê um nome ao seu workspace."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const [createdName, setCreatedName] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({ resolver: zodResolver(onboardingSchema) });

  async function onSubmit(values: OnboardingValues) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    setCreatedName(values.workspaceName);
  }

  if (createdName) {
    return (
      <div className="space-y-6 text-center">
        <span className="bg-success/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </span>
        <div>
          <p className="text-lg font-semibold text-foreground">Workspace criado!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{createdName}</span> está pronto. O painel
            completo chega nos próximos milestones.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="workspaceName">Nome do workspace</Label>
        <Input
          id="workspaceName"
          placeholder="Ex.: Minha Empresa"
          autoComplete="organization"
          aria-invalid={!!errors.workspaceName}
          {...register("workspaceName")}
        />
        {errors.workspaceName && (
          <p className="text-xs text-destructive">{errors.workspaceName.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Você poderá convidar seu time e enviar o logo depois, nas configurações.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Criando workspace..." : "Criar workspace"}
      </Button>
    </form>
  );
}
