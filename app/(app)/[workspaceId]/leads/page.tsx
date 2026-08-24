import { LeadsTable } from "@/components/leads/leads-table";
import { toOneRelation } from "@/lib/supabase/relations";
import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus } from "@/types/lead";

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: { workspaceId: string };
  searchParams: { search?: string; status?: string; ownerId?: string; from?: string; to?: string };
}) {
  const supabase = createClient();

  const { data: memberRows } = await supabase
    .from("memberships")
    .select("profiles(id, name)")
    .eq("workspace_id", params.workspaceId);

  const members = (memberRows ?? [])
    .map((row) => toOneRelation(row.profiles as { id: string; name: string } | { id: string; name: string }[] | null))
    .filter((profile): profile is { id: string; name: string } => !!profile);

  let query = supabase
    .from("leads")
    .select("id, name, email, phone, company, role, status, owner_id, created_at, profiles(name)")
    .eq("workspace_id", params.workspaceId)
    .order("created_at", { ascending: false });

  const search = searchParams.search?.trim().replace(/[,()]/g, "");
  if (search) {
    const term = `%${search}%`;
    query = query.or(`name.ilike.${term},email.ilike.${term},company.ilike.${term}`);
  }
  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.ownerId) query = query.eq("owner_id", searchParams.ownerId);
  if (searchParams.from) query = query.gte("created_at", searchParams.from);
  if (searchParams.to) query = query.lte("created_at", `${searchParams.to}T23:59:59`);

  const { data: rows } = await query;

  const leads: Lead[] = (rows ?? []).map((row) => {
    const owner = toOneRelation(row.profiles as { name: string } | { name: string }[] | null);
    return {
      id: row.id,
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      company: row.company ?? "",
      role: row.role ?? "",
      status: row.status as LeadStatus,
      ownerId: row.owner_id ?? "",
      ownerName: owner?.name ?? "Sem responsável",
      createdAt: row.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Centralize contatos, histórico e status de cada oportunidade.
        </p>
      </div>
      <LeadsTable
        workspaceId={params.workspaceId}
        leads={leads}
        members={members}
        filters={{
          search: searchParams.search ?? "",
          status: searchParams.status ?? "",
          ownerId: searchParams.ownerId ?? "",
          from: searchParams.from ?? "",
          to: searchParams.to ?? "",
        }}
      />
    </div>
  );
}
