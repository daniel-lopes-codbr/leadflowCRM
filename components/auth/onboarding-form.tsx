"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/app/(auth)/onboarding/actions";

const onboardingSchema = z.object({
  workspaceName: z.string().min(2, "Dê um nome ao seu workspace."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({ resolver: zodResolver(onboardingSchema) });

  async function onSubmit(values: OnboardingValues) {
    setSubmitError(null);
    const result = await createWorkspace(values);
    if (result?.status === "error") {
      setSubmitError(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não foi possível criar o workspace</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

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
