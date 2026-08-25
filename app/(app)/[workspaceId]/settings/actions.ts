"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PLAN_LIMITS } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createResendClient, FROM_EMAIL } from "@/lib/resend/client";
import { escapeHtml } from "@/lib/utils";

export type SettingsActionResult = { status: "success" } | { status: "error"; message: string };

const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const inviteEmailSchema = z.string().trim().min(1, "Informe o e-mail.").email("Digite um e-mail válido.");

async function requireUser(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = "/workspace-assets/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function inviteMember(input: {
  workspaceId: string;
  email: string;
  role: "admin" | "member";
}): Promise<SettingsActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const emailParsed = inviteEmailSchema.safeParse(input.email);
  if (!emailParsed.success) {
    return { status: "error", message: emailParsed.error.issues[0]?.message ?? "E-mail inválido." };
  }
  const email = emailParsed.data;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, plan, logo_url")
    .eq("id", input.workspaceId)
    .single();

  if (!workspace) {
    return { status: "error", message: "Workspace não encontrado." };
  }

  const plan = workspace.plan === "pro" ? "pro" : "free";
  const memberLimit = PLAN_LIMITS[plan].members;

  if (Number.isFinite(memberLimit)) {
    const { count: memberCount } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", input.workspaceId);

    if ((memberCount ?? 0) >= memberLimit) {
      return {
        status: "error",
        message: `O plano ${plan === "free" ? "Free" : "Pro"} permite até ${memberLimit} colaborador(es). Faça upgrade para o Pro para convidar mais pessoas.`,
      };
    }
  }

  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .upsert(
      {
        workspace_id: input.workspaceId,
        email,
        role: input.role,
        invited_by: user.id,
        token: crypto.randomUUID(),
        accepted_at: null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "workspace_id,email" }
    )
    .select("token")
    .single();

  if (inviteError || !invite) {
    return { status: "error", message: "Não foi possível gerar o convite." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/signup?token=${invite.token}`;
  const safeWorkspaceName = escapeHtml(workspace.name);
  const logoHeader = workspace.logo_url
    ? `<img src="${escapeHtml(workspace.logo_url)}" alt="${safeWorkspaceName}" height="32" style="display:block;margin-bottom:16px;border-radius:6px;" />`
    : "";
  const unsubscribeUrl = `${appUrl}/api/email/unsubscribe?token=${invite.token}`;
  const footer = `<p style="margin-top:24px;font-size:12px;color:#94a3b8;">Não quer mais receber e-mails como este? <a href="${unsubscribeUrl}" style="color:#94a3b8;">Cancelar inscrição</a>.</p>`;

  // email_opt_outs tem RLS sem nenhuma policy pra authenticated (só
  // service_role acessa) — tem que ser o admin client, senão a query
  // simplesmente não vê nada e o opt-out passa despercebido.
  const admin = createAdminClient();
  const { data: optedOut } = await admin
    .from("email_opt_outs")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (optedOut) {
    return {
      status: "error",
      message:
        "Este e-mail optou por não receber mensagens do LeadFlow. Peça para a pessoa acessar: " +
        inviteUrl,
    };
  }

  try {
    const resend = createResendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Você foi convidado para o workspace ${workspace.name} no LeadFlow CRM`,
      html: `${logoHeader}<p>Você foi convidado para colaborar no workspace <strong>${safeWorkspaceName}</strong> no LeadFlow CRM.</p><p><a href="${inviteUrl}">Aceitar convite e criar sua conta</a></p>${footer}`,
    });
  } catch {
    return {
      status: "error",
      message:
        "Convite não pôde ser enviado (Resend não configurado). Peça para a pessoa acessar: " +
        inviteUrl,
    };
  }

  await admin.from("audit_logs").insert({
    workspace_id: input.workspaceId,
    actor_id: user.id,
    event_type: "member.invited",
    metadata: { email, role: input.role },
  });

  return { status: "success" };
}

export async function cancelInvite(workspaceId: string, inviteId: string): Promise<SettingsActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível cancelar o convite." };
  }

  revalidatePath(`/${workspaceId}/settings`);
  return { status: "success" };
}

export async function removeMember(
  workspaceId: string,
  memberUserId: string
): Promise<SettingsActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { data: target } = await supabase
    .from("memberships")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", memberUserId)
    .maybeSingle();

  if (!target) {
    return { status: "error", message: "Membro não encontrado." };
  }

  if (target.role === "admin") {
    const { count: adminCount } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("role", "admin");

    if ((adminCount ?? 0) <= 1) {
      return { status: "error", message: "O workspace precisa de pelo menos um admin." };
    }
  }

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", memberUserId);

  if (error) {
    return { status: "error", message: "Não foi possível remover o membro." };
  }

  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    workspace_id: workspaceId,
    actor_id: user.id,
    event_type: "member.removed",
    metadata: { removed_user_id: memberUserId },
  });

  revalidatePath(`/${workspaceId}/settings`);
  return { status: "success" };
}

const workspaceNameSchema = z.string().trim().min(1, "Informe o nome do workspace.");

export async function updateWorkspace(formData: FormData): Promise<SettingsActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const workspaceId = String(formData.get("workspaceId") ?? "");
  if (!workspaceId) {
    return { status: "error", message: "Workspace inválido." };
  }

  const nameParsed = workspaceNameSchema.safeParse(formData.get("name"));
  if (!nameParsed.success) {
    return { status: "error", message: nameParsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("logo_url")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { status: "error", message: "Workspace não encontrado." };
  }

  let logoUrl = workspace.logo_url as string | null;
  const removeLogo = formData.get("removeLogo") === "true";
  const logoFile = formData.get("logo");

  if (removeLogo && logoUrl) {
    const path = extractStoragePath(logoUrl);
    if (path) await supabase.storage.from("workspace-assets").remove([path]);
    logoUrl = null;
  }

  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ACCEPTED_LOGO_TYPES.includes(logoFile.type)) {
      return { status: "error", message: "Formato inválido. Envie PNG, JPG, SVG ou WebP." };
    }
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { status: "error", message: "O arquivo excede o tamanho máximo de 2MB." };
    }

    const ext = logoFile.name.split(".").pop() || "png";
    const path = `${workspaceId}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("workspace-assets")
      .upload(path, logoFile, { contentType: logoFile.type });

    if (uploadError) {
      return { status: "error", message: "Não foi possível enviar a logo." };
    }

    const previousLogoUrl = logoUrl;
    logoUrl = supabase.storage.from("workspace-assets").getPublicUrl(path).data.publicUrl;

    if (previousLogoUrl) {
      const previousPath = extractStoragePath(previousLogoUrl);
      if (previousPath) await supabase.storage.from("workspace-assets").remove([previousPath]);
    }
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ name: nameParsed.data, logo_url: logoUrl })
    .eq("id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível salvar as alterações." };
  }

  revalidatePath(`/${workspaceId}`, "layout");
  return { status: "success" };
}

export async function deleteWorkspace(
  workspaceId: string,
  confirmName: string
): Promise<SettingsActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, logo_url")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { status: "error", message: "Workspace não encontrado." };
  }

  if (confirmName !== workspace.name) {
    return { status: "error", message: "O nome digitado não confere." };
  }

  const admin = createAdminClient();

  // Grava o log antes de excluir: o FK de audit_logs.workspace_id agora é
  // ON DELETE SET NULL (ver migration LGPD), então o registro sobrevive à
  // exclusão, mas a linha do workspace ainda precisa existir nesse insert
  // pra satisfazer o constraint.
  await admin.from("audit_logs").insert({
    workspace_id: workspaceId,
    actor_id: user.id,
    event_type: "workspace.deleted",
    metadata: { name: workspace.name },
  });

  if (workspace.logo_url) {
    const path = extractStoragePath(workspace.logo_url);
    if (path) await admin.storage.from("workspace-assets").remove([path]);
  }

  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível excluir o workspace." };
  }

  redirect("/onboarding");
}
