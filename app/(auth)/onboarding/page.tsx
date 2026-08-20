import type { Metadata } from "next";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Crie seu workspace · LeadFlow CRM",
};

export default function OnboardingPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Crie seu workspace</CardTitle>
        <CardDescription>
          Cada empresa ou time tem o próprio workspace, isolado dos demais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}
