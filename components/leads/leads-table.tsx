"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLead, updateLead } from "@/app/(app)/[workspaceId]/leads/actions";
import { LeadFormDialog, type LeadFormValues } from "@/components/leads/lead-form-dialog";
import { StatusBadge } from "@/components/leads/status-badge";
import { LEAD_STATUSES, type Lead } from "@/types/lead";

const ALL = "all";

type LeadFilters = { search: string; status: string; ownerId: string; from: string; to: string };
type Member = { id: string; name: string };

export function LeadsTable({
  workspaceId,
  leads,
  members,
  filters,
}: {
  workspaceId: string;
  leads: Lead[];
  members: Member[];
  filters: LeadFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    if (searchInput === filters.search) return;
    const handle = setTimeout(() => updateParam("search", searchInput), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function openCreateDialog() {
    setEditingLead(null);
    setDialogOpen(true);
  }

  function openEditDialog(lead: Lead) {
    setEditingLead(lead);
    setDialogOpen(true);
  }

  async function handleSubmit(values: LeadFormValues) {
    const result = editingLead
      ? await updateLead(workspaceId, editingLead.id, values)
      : await createLead(workspaceId, values);

    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou empresa"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="pl-8"
            />
          </div>

          <Select
            value={filters.status || ALL}
            onValueChange={(value) => updateParam("status", value)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os status</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.ownerId || ALL}
            onValueChange={(value) => updateParam("ownerId", value)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os responsáveis</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.from}
              onChange={(event) => updateParam("from", event.target.value)}
              className="w-full sm:w-36"
              aria-label="Criado a partir de"
            />
            <span className="text-sm text-muted-foreground">até</span>
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => updateParam("to", event.target.value)}
              className="w-full sm:w-36"
              aria-label="Criado até"
            />
          </div>
        </div>

        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="h-4 w-4" />
          Novo lead
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Empresa</TableHead>
              <TableHead className="hidden lg:table-cell">Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Criado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum lead encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead) => (
              <TableRow key={lead.id} className="group">
                <TableCell>
                  <Link
                    href={`/${workspaceId}/leads/${lead.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-xs text-muted-foreground md:hidden">{lead.company}</p>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {lead.company}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {lead.ownerName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    aria-label={`Editar ${lead.name}`}
                    onClick={() => openEditDialog(lead)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LeadFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editingLead}
        members={members}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
