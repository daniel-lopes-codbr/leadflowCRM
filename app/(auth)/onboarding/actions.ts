"use server";

import { redirect } from "next/navigation";
import { PUBLIC_EMAIL_DOMAINS } from "@/lib/email-domains";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// A partir de quantos workspaces free com admin no mesmo domínio de e-mail
// (não-público) o padrão vira digno de nota — não bloqueia ninguém, só fica
// registrado pra revisão manual (M21, antiabuso do Free). 2-3 pessoas da
// mesma empresa testando o Free é normal; muito mais que isso, cada uma com
// seu próprio workspace free, é o padrão de "várias contas free simulando um
// time Pro sem pagar" que a pesquisa de mercado alertou.
const SUSPICIOUS_DOMAIN_THRESHOLD = 3;

async function countSiblingFreeWorkspaces(
  admin: ReturnType<typeof createAdminClient>,
  email: string | undefined,
  excludeUserId: string
): Promise<number> {
  const domain = email?.split("@")[1]?.toLowerCase();
  if (!domain || PUBLIC_EMAIL_DOMAINS.has(domain)) return 0;

  const { data: matchingProfiles } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", `%@${domain}`);

  const otherUserIds = (matchingProfiles ?? [])
    .map((p) => p.id)
    .filter((id) => id !== excludeUserId);

  if (otherUserIds.length === 0) return 0;

  const { data: siblingMemberships } = await admin
    .from("memberships")
    .select("workspace_id, workspaces(plan)")
    .eq("role", "admin")
    .in("user_id", otherUserIds);

  const freeWorkspaceIds = new Set(
    (siblingMemberships ?? [])
      .filter((m) => {
        const workspace = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces;
        return workspace?.plan === "free";
      })
      .map((m) => m.workspace_id)
  );

  return freeWorkspaceIds.size;
}

export async function createWorkspace(input: {
  workspaceName: string;
}): Promise<{ status: "error"; message: string } | void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Geramos o id no servidor (em vez de deixar o banco gerar e pedir de volta
  // via RETURNING) porque, logo após o insert, ainda não existe membership
  // para este workspace — e a policy de SELECT de `workspaces` exige ser
  // membro. Pedir representação do insert (RETURNING) cairia nessa mesma
  // policy e falharia, mesmo o INSERT em si sendo permitido.
  const workspaceId = crypto.randomUUID();

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ id: workspaceId, name: input.workspaceName });

  if (workspaceError) {
    return { status: "error", message: "Não foi possível criar o workspace. Tente novamente." };
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({ workspace_id: workspaceId, user_id: user.id, role: "admin" });

  if (membershipError) {
    return {
      status: "error",
      message: "Workspace criado, mas houve um erro ao vincular sua conta.",
    };
  }

  const admin = createAdminClient();

  const siblingFreeWorkspaces = await countSiblingFreeWorkspaces(admin, user.email, user.id);

  await admin.from("audit_logs").insert({
    workspace_id: workspaceId,
    actor_id: user.id,
    event_type: "workspace.created",
    metadata: {
      name: input.workspaceName,
      // Não bloqueia a criação — só registra pra revisão manual quando o
      // padrão aparece (ver countSiblingFreeWorkspaces acima).
      ...(siblingFreeWorkspaces >= SUSPICIOUS_DOMAIN_THRESHOLD
        ? { flagged_domain_reuse: true, sibling_free_workspaces: siblingFreeWorkspaces }
        : {}),
    },
  });

  redirect(`/${workspaceId}/dashboard`);
}
