import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center gap-3">
          <Rocket className="h-6 w-6 text-primary" />
          <CardTitle>LeadFlow CRM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Setup do projeto concluído: Next.js, Tailwind, shadcn/ui e Lucide Icons prontos.
          </p>
          <div className="flex items-center gap-2">
            <Badge>Free</Badge>
            <Badge variant="secondary">Pro</Badge>
          </div>
          <Button>Começar</Button>
        </CardContent>
      </Card>
    </main>
  );
}
