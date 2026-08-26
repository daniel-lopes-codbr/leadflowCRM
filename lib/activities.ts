import "server-only";
import type { createClient } from "@/lib/supabase/server";

// Registra a troca de responsável na própria timeline do lead (tabela
// activities já existente) — sem isso, quando um vendedor sai e o lead é
// reatribuído, o próximo responsável não tem como saber quem cuidava daquilo
// antes nem quando a troca aconteceu.
export async function logOwnerChangeActivity(
  supabase: ReturnType<typeof createClient>,
  params: {
    workspaceId: string;
    leadId: string | null;
    previousOwnerId: string | null;
    newOwnerId: string | null;
    actorId: string;
  }
) {
  // Negócio sem lead vinculado não tem timeline pra registrar a troca.
  if (!params.leadId) return;
  if (params.previousOwnerId === params.newOwnerId) return;

  const ids = [params.previousOwnerId, params.newOwnerId].filter((id): id is string => !!id);
  const { data: profiles } =
    ids.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", ids)
      : { data: [] as { id: string; name: string }[] };

  const nameFor = (id: string | null) => profiles?.find((p) => p.id === id)?.name ?? "Sem responsável";

  await supabase.from("activities").insert({
    workspace_id: params.workspaceId,
    lead_id: params.leadId,
    type: "Responsável",
    description: `Responsabilidade transferida de ${nameFor(params.previousOwnerId)} para ${nameFor(params.newOwnerId)}.`,
    author_id: params.actorId,
    occurred_at: new Date().toISOString(),
  });
}
