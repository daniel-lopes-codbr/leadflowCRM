"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  await admin.from("audit_logs").insert({
    workspace_id: workspaceId,
    actor_id: user.id,
    event_type: "workspace.created",
    metadata: { name: input.workspaceName },
  });

  redirect(`/${workspaceId}/dashboard`);
}
