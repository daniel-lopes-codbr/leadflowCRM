"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertTriangle, CheckCircle2, Loader2, Trash2, UserPlus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cancelInvite, inviteMember, removeMember } from "@/app/(app)/[workspaceId]/settings/actions";
import { PLAN_LIMITS, type WorkspacePlan } from "@/lib/plans";

export type Member = {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "member";
};

export type PendingInvite = {
  id: string;
  email: string;
  role: "admin" | "member";
  expiresAt: string;
};

const inviteSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("Digite um e-mail válido."),
  role: z.enum(["admin", "member"]),
});

type InviteValues = z.infer<typeof inviteSchema>;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function MembersPanel({
  workspaceId,
  plan,
  members,
  pendingInvites,
  currentUserId,
  isAdmin,
}: {
  workspaceId: string;
  plan: WorkspacePlan;
  members: Member[];
  pendingInvites: PendingInvite[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState<Member | null>(null);
  const [removingBusy, setRemovingBusy] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; message: string } | null>(null);

  const limit = PLAN_LIMITS[plan].members;
  const atLimit = members.length >= limit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" },
  });

  async function onInvite(values: InviteValues) {
    setInviteResult(null);
    const result = await inviteMember({ workspaceId, email: values.email, role: values.role });
    setInviteResult({
      ok: result.status === "success",
      message: result.status === "success" ? `Convite enviado para ${values.email}.` : result.message,
    });

    if (result.status === "success") {
      reset();
      router.refresh();
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setRemovingBusy(true);
    const result = await removeMember(workspaceId, removing.userId);
    setRemovingBusy(false);
    setRemoving(null);
    if (result.status === "success") router.refresh();
  }

  async function handleCancelInvite(inviteId: string) {
    setCancellingId(inviteId);
    await cancelInvite(workspaceId, inviteId);
    setCancellingId(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Membros</CardTitle>
        <CardDescription>
          Convide vendedores para o workspace e gerencie permissões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {atLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Limite de colaboradores atingido</AlertTitle>
            <AlertDescription>
              O plano Free permite {limit} colaborador. Faça upgrade para o Pro para convidar mais
              pessoas.
            </AlertDescription>
          </Alert>
        )}

        {inviteResult && (
          <Alert variant={inviteResult.ok ? "success" : "destructive"}>
            {inviteResult.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{inviteResult.message}</AlertDescription>
          </Alert>
        )}

        {isAdmin && (
          <form
            onSubmit={handleSubmit(onInvite)}
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="flex-1">
              <Input
                placeholder="email@empresa.com"
                disabled={atLimit}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value as "admin" | "member")}
              disabled={atLimit}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={atLimit || isSubmitting} className="shrink-0">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Convidar
            </Button>
          </form>
        )}

        <ul className="divide-y divide-border">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-xs font-semibold">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.name}
                    {member.userId === currentUserId && " (você)"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                  {member.role === "admin" ? "Admin" : "Membro"}
                </Badge>
                {isAdmin && member.userId !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover ${member.name}`}
                    onClick={() => setRemoving(member)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {isAdmin && pendingInvites.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Convites pendentes</p>
            <ul className="divide-y divide-border">
              {pendingInvites.map((invite) => {
                const expired = new Date(invite.expiresAt) < new Date();
                return (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-foreground">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {invite.role === "admin" ? "Admin" : "Membro"}
                        {expired ? " · expirado" : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Cancelar convite de ${invite.email}`}
                      disabled={cancellingId === invite.id}
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      {cancellingId === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa pessoa perderá o acesso a este workspace imediatamente. Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} disabled={removingBusy}>
              {removingBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
