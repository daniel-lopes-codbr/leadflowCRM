"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logOwnerChangeActivity } from "@/lib/activities";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES } from "@/types/lead";

export type DealActionResult = { status: "success" } | { status: "error"; message: string };

const dealInputSchema = z.object({
  title: z.string().trim().min(2, "Dê um título ao negócio."),
  value: z.number().min(0, "Informe um valor válido."),
  leadId: z.string().trim().min(1, "Selecione o lead vinculado."),
  ownerId: z.string().trim().min(1, "Selecione um responsável."),
  deadline: z.string().min(1, "Informe o prazo."),
  status: z.enum(LEAD_STATUSES),
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

export async function createDeal(workspaceId: string, input: unknown): Promise<DealActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsed = dealInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const { error } = await supabase.from("deals").insert({
    workspace_id: workspaceId,
    lead_id: parsed.data.leadId,
    title: parsed.data.title,
    value: parsed.data.value,
    status: parsed.data.status,
    owner_id: parsed.data.ownerId,
    deadline: parsed.data.deadline,
  });

  if (error) {
    return { status: "error", message: "Não foi possível criar o negócio." };
  }

  revalidatePath(`/${workspaceId}/pipeline`);
  return { status: "success" };
}

export async function updateDeal(
  workspaceId: string,
  dealId: string,
  input: unknown
): Promise<DealActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsed = dealInputSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const { data: currentDeal } = await supabase
    .from("deals")
    .select("owner_id, lead_id")
    .eq("id", dealId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { error } = await supabase
    .from("deals")
    .update({
      lead_id: parsed.data.leadId,
      title: parsed.data.title,
      value: parsed.data.value,
      status: parsed.data.status,
      owner_id: parsed.data.ownerId,
      deadline: parsed.data.deadline,
    })
    .eq("id", dealId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível salvar as alterações." };
  }

  if (currentDeal && currentDeal.owner_id !== parsed.data.ownerId) {
    await logOwnerChangeActivity(supabase, {
      workspaceId,
      leadId: currentDeal.lead_id,
      previousOwnerId: currentDeal.owner_id,
      newOwnerId: parsed.data.ownerId,
      actorId: user.id,
    });
  }

  revalidatePath(`/${workspaceId}/pipeline`);
  return { status: "success" };
}

export async function updateDealStatus(
  workspaceId: string,
  dealId: string,
  status: string
): Promise<DealActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const parsedStatus = z.enum(LEAD_STATUSES).safeParse(status);
  if (!parsedStatus.success) {
    return { status: "error", message: "Etapa inválida." };
  }

  const { error } = await supabase
    .from("deals")
    .update({ status: parsedStatus.data })
    .eq("id", dealId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { status: "error", message: "Não foi possível mover o negócio." };
  }

  revalidatePath(`/${workspaceId}/pipeline`);
  return { status: "success" };
}
