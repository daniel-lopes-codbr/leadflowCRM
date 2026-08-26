"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logOwnerChangeActivity } from "@/lib/activities";
import { PLAN_LIMITS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { ACTIVITY_TYPES } from "@/types/activity";
import { LEAD_STATUSES } from "@/types/lead";

export type LeadActionResult = { status: "success" } | { status: "error"; message: string };

const leadInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do lead."),
  email: z.string().trim().min(1, "Informe o e-mail.").email("Digite um e-mail válido."),
  phone: z.string().trim().min(8, "Informe um telefone válido."),
  company: z.string().trim().min(1, "Informe a empresa."),
  role: z.string().trim().min(1, "Informe o cargo."),
  status: z.enum(LEAD_STATUSES),
  ownerId: z.string().trim().min(1, "Selecione um responsável."),
});

const activityInputSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  description: z.string().trim().min(3, "Descreva a interação."),
  occurredAt: z.string().min(1, "Informe a data."),
});

function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createLead(workspaceId: string, input: unknown): Promise<LeadActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsed = leadInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { status: "error", message: "Workspace não encontrado." };
  }

  const leadLimit = PLAN_LIMITS[workspace.plan === "pro" ? "pro" : "free"].leads;
  if (Number.isFinite(leadLimit)) {
    const { count } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if ((count ?? 0) >= leadLimit) {
      return {
        status: "error",
        message: `O plano Free permite até ${leadLimit} leads. Faça upgrade para o Pro para cadastrar mais.`,
      };
    }
  }

  const { error } = await supabase.from("leads").insert({
    workspace_id: workspaceId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    company: parsed.data.company,
    role: parsed.data.role,
    status: parsed.data.status,
    owner_id: parsed.data.ownerId,
  });

  if (error) {
    return { status: "error", message: "Não foi possível criar o lead." };
  }

  revalidatePath(`/${workspaceId}/leads`);
  return { status: "success" };
}

export async function updateLead(
  workspaceId: string,
  leadId: string,
  input: unknown
): Promise<LeadActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsed = leadInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const { data: currentLead } = await supabase
    .from("leads")
    .select("owner_id")
    .eq("id", leadId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { error } = await supabase
    .from("leads")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      role: parsed.data.role,
      status: parsed.data.status,
      owner_id: parsed.data.ownerId,
    })
    .eq("id", leadId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível salvar as alterações." };
  }

  if (currentLead && currentLead.owner_id !== parsed.data.ownerId) {
    await logOwnerChangeActivity(supabase, {
      workspaceId,
      leadId,
      previousOwnerId: currentLead.owner_id,
      newOwnerId: parsed.data.ownerId,
      actorId: user.id,
    });
  }

  revalidatePath(`/${workspaceId}/leads`);
  revalidatePath(`/${workspaceId}/leads/${leadId}`);
  return { status: "success" };
}

export async function deleteLead(workspaceId: string, leadId: string): Promise<LeadActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível excluir o lead." };
  }

  revalidatePath(`/${workspaceId}/leads`);
  return { status: "success" };
}

export async function createActivity(
  workspaceId: string,
  leadId: string,
  input: unknown
): Promise<LeadActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsed = activityInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const occurredAt = new Date(parsed.data.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) {
    return { status: "error", message: "Informe uma data válida." };
  }

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    type: parsed.data.type,
    description: parsed.data.description,
    author_id: user.id,
    occurred_at: occurredAt.toISOString(),
  });

  if (error) {
    return { status: "error", message: "Não foi possível registrar a atividade." };
  }

  revalidatePath(`/${workspaceId}/leads/${leadId}`);
  return { status: "success" };
}
