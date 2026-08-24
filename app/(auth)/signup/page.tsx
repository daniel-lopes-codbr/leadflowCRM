import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Criar conta · LeadFlow CRM",
};

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Criar conta grátis</CardTitle>
        <CardDescription>Sem cartão de crédito. Leva menos de 2 minutos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
