import { LeadsTable } from "@/components/leads/leads-table";

export default function LeadsPage({ params }: { params: { workspaceId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Centralize contatos, histórico e status de cada oportunidade.
        </p>
      </div>
      <LeadsTable workspaceId={params.workspaceId} />
    </div>
  );
}
