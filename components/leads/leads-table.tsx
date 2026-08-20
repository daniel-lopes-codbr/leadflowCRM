"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { mockLeads, mockOwners } from "@/components/leads/data";
import { LeadFormDialog, type LeadFormValues } from "@/components/leads/lead-form-dialog";
import { StatusBadge } from "@/components/leads/status-badge";
import { LEAD_STATUSES, type Lead } from "@/types/lead";

const ALL = "all";

export function LeadsTable({ workspaceId }: { workspaceId: string }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [ownerFilter, setOwnerFilter] = useState<string>(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search.trim().length === 0 ||
        [lead.name, lead.email, lead.company].some((field) =>
          field.toLowerCase().includes(search.trim().toLowerCase())
        );
      const matchesStatus = statusFilter === ALL || lead.status === statusFilter;
      const matchesOwner = ownerFilter === ALL || lead.ownerId === ownerFilter;
      const matchesFrom = !dateFrom || lead.createdAt >= dateFrom;
      const matchesTo = !dateTo || lead.createdAt <= dateTo;
      return matchesSearch && matchesStatus && matchesOwner && matchesFrom && matchesTo;
    });
  }, [leads, search, statusFilter, ownerFilter, dateFrom, dateTo]);

  function openCreateDialog() {
    setEditingLead(null);
    setDialogOpen(true);
  }

  function openEditDialog(lead: Lead) {
    setEditingLead(lead);
    setDialogOpen(true);
  }

  function handleSubmit(values: LeadFormValues) {
    const owner = mockOwners.find((o) => o.id === values.ownerId)!;

    if (editingLead) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === editingLead.id ? { ...lead, ...values, ownerName: owner.name } : lead
        )
      );
      return;
    }

    setLeads((prev) => [
      {
        id: `l${Date.now()}`,
        ...values,
        ownerName: owner.name,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou empresa"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os responsáveis</SelectItem>
              {mockOwners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full sm:w-36"
              aria-label="Criado a partir de"
            />
            <span className="text-sm text-muted-foreground">até</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
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
            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum lead encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.map((lead) => (
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
        onSubmit={handleSubmit}
      />
    </div>
  );
}
