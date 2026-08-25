import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { acceptInvite } from "@/app/(auth)/join/actions";

export const metadata: Metadata = {
  title: "Aceitar convite · LeadFlow CRM",
};

export default async function JoinPage(
  props: {
    searchParams: Promise<{ token?: string; error?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <InviteCard title="Convite não encontrado">
        <p className="text-sm text-muted-foreground">O link de convite está incompleto.</p>
      </InviteCard>
    );
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invites")
    .select("workspace_id, email, role, accepted_at, expires_at, workspaces(name)")
    .eq("token", token)
    .maybeSingle();

  if (!invite || invite.accepted_at || new Date(invite.expires_at) < new Date()) {
    return (
      <InviteCard title="Convite indisponível">
        <p className="text-sm text-muted-foreground">
          Este convite não existe mais, já foi usado ou expirou. Peça para o administrador do
          workspace enviar um novo.
        </p>
      </InviteCard>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const workspaceName =
    (invite.workspaces as unknown as { name: string } | null)?.name ?? "workspace";

  return (
    <InviteCard title="Você foi convidado!">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{invite.email}</span> foi convidado para o
        workspace <span className="font-medium text-foreground">{workspaceName}</span>.
      </p>

      {searchParams.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      )}

      {user ? (
        <form action={acceptInvite.bind(null, token)}>
          <Button type="submit" className="w-full">
            Entrar em {workspaceName}
          </Button>
        </form>
      ) : (
        <Button asChild className="w-full">
          <Link href={`/signup?token=${token}`}>Criar conta com {invite.email}</Link>
        </Button>
      )}
    </InviteCard>
  );
}

function InviteCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="sr-only">Convite de workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
