"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ACTIVITY_TYPES } from "@/types/activity";

export type FollowUpActionResult = { status: "success" } | { status: "error"; message: string };

const followUpInputSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  description: z.string().trim().min(3, "Descreva o que precisa ser feito."),
  scheduledAt: z.string().min(1, "Informe a data."),
});

function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

async function requireUser(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function revalidateLead(workspaceId: string, leadId: string) {
  revalidatePath(`/${workspaceId}/leads/${leadId}`);
  revalidatePath(`/${workspaceId}/dashboard`);
  revalidatePath(`/${workspaceId}/pipeline`);
}

export async function createFollowUp(
  workspaceId: string,
  leadId: string,
  input: unknown
): Promise<FollowUpActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsed = followUpInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    type: parsed.data.type,
    description: parsed.data.description,
    author_id: user.id,
    scheduled_at: parsed.data.scheduledAt,
  });

  if (error) {
    return { status: "error", message: "Não foi possível agendar o follow-up." };
  }

  revalidateLead(workspaceId, leadId);
  return { status: "success" };
}

// Concluir/cancelar nunca apagam a linha — só fecham o follow-up, preservando
// o registro na timeline mesmo que o responsável do lead mude depois.
export async function completeFollowUp(
  workspaceId: string,
  leadId: string,
  activityId: string
): Promise<FollowUpActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("activities")
    .update({ completed_at: now, occurred_at: now })
    .eq("id", activityId)
    .eq("workspace_id", workspaceId)
    .is("completed_at", null)
    .is("canceled_at", null);

  if (error) {
    return { status: "error", message: "Não foi possível concluir o follow-up." };
  }

  revalidateLead(workspaceId, leadId);
  return { status: "success" };
}

export async function cancelFollowUp(
  workspaceId: string,
  leadId: string,
  activityId: string
): Promise<FollowUpActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("activities")
    .update({ canceled_at: new Date().toISOString() })
    .eq("id", activityId)
    .eq("workspace_id", workspaceId)
    .is("completed_at", null)
    .is("canceled_at", null);

  if (error) {
    return { status: "error", message: "Não foi possível cancelar o follow-up." };
  }

  revalidateLead(workspaceId, leadId);
  return { status: "success" };
}

// Reagendar não sobrescreve a data do follow-up original — cancela o antigo
// e cria um novo, preservando o rastro de que ele foi remarcado.
export async function rescheduleFollowUp(
  workspaceId: string,
  leadId: string,
  activityId: string,
  newScheduledAt: string
): Promise<FollowUpActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  if (!newScheduledAt) {
    return { status: "error", message: "Informe a nova data." };
  }

  const { data: original } = await supabase
    .from("activities")
    .select("type, description, lead_id")
    .eq("id", activityId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!original) {
    return { status: "error", message: "Follow-up não encontrado." };
  }

  const { error: cancelError } = await supabase
    .from("activities")
    .update({ canceled_at: new Date().toISOString() })
    .eq("id", activityId)
    .eq("workspace_id", workspaceId)
    .is("completed_at", null)
    .is("canceled_at", null);

  if (cancelError) {
    return { status: "error", message: "Não foi possível reagendar o follow-up." };
  }

  const { error: insertError } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: original.lead_id,
    type: original.type,
    description: original.description,
    author_id: user.id,
    scheduled_at: newScheduledAt,
  });

  if (insertError) {
    return {
      status: "error",
      message: "Follow-up cancelado, mas não foi possível criar o novo agendamento.",
    };
  }

  revalidateLead(workspaceId, leadId);
  return { status: "success" };
}
