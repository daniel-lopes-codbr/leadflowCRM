"use client";

import { useState } from "react";
import { AlertTriangle, Download, Loader2, Trash2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteWorkspace } from "@/app/(app)/[workspaceId]/settings/actions";

export function DataPrivacyPanel({
  workspaceId,
  workspaceName,
  isAdmin,
}: {
  workspaceId: string;
  workspaceName: string;
  isAdmin: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteWorkspace(workspaceId, confirmText);
    setDeleting(false);
    if (result?.status === "error") setDeleteError(result.message);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportar dados</CardTitle>
          <CardDescription>
            Baixe os leads, negócios e atividades deste workspace, em conformidade com a LGPD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && (
            <p className="text-xs text-muted-foreground">
              Só administradores podem exportar dados do workspace.
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" disabled={!isAdmin} asChild={isAdmin}>
              {isAdmin ? (
                <a href={`/api/workspaces/${workspaceId}/export?format=csv`}>
                  <Download className="h-4 w-4" />
                  Exportar leads (CSV)
                </a>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar leads (CSV)
                </>
              )}
            </Button>
            <Button variant="outline" disabled={!isAdmin} asChild={isAdmin}>
              {isAdmin ? (
                <a href={`/api/workspaces/${workspaceId}/export?format=json`}>
                  <Download className="h-4 w-4" />
                  Exportar tudo (JSON)
                </a>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar tudo (JSON)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Excluir workspace</CardTitle>
          <CardDescription>
            Remove permanentemente todos os leads, negócios e atividades deste workspace. Essa ação
            não pode ser desfeita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            disabled={!isAdmin}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir workspace
          </Button>
          {!isAdmin && (
            <p className="mt-2 text-xs text-muted-foreground">
              Só administradores podem excluir o workspace.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (deleting) return;
          setDeleteOpen(open);
          if (!open) {
            setConfirmText("");
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir &quot;{workspaceName}&quot; permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados deste workspace serão apagados. Digite o nome do workspace para
              confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete" className="sr-only">
              Confirme o nome do workspace
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={workspaceName}
              disabled={deleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== workspaceName || deleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              className="text-destructive-foreground hover:bg-destructive/90 bg-destructive"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
