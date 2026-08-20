"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2, Trash2 } from "lucide-react";
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
import { mockWorkspace } from "@/components/settings/data";

export function DataPrivacyPanel() {
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function handleExport(format: "csv" | "json") {
    setExportFormat(format);
    setExportDone(false);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setExportFormat(null);
    setExportDone(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportar dados</CardTitle>
          <CardDescription>
            Baixe todos os leads, negócios e atividades deste workspace, em conformidade com a LGPD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportDone && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Exportação gerada (mock). O download real chega no M15.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={exportFormat !== null}
            >
              {exportFormat === "csv" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("json")}
              disabled={exportFormat !== null}
            >
              {exportFormat === "json" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exportar JSON
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
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir workspace
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir &quot;{mockWorkspace.name}&quot; permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados deste workspace serão apagados. Digite o nome do workspace para
              confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete" className="sr-only">
              Confirme o nome do workspace
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={mockWorkspace.name}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== mockWorkspace.name}
              onClick={() => setDeleteOpen(false)}
              className="text-destructive-foreground hover:bg-destructive/90 bg-destructive"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
