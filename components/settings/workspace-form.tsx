"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspace } from "@/app/(app)/[workspaceId]/settings/actions";
import { compressImage } from "@/lib/image/compress-image";
import type { WorkspacePlan } from "@/lib/plans";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export function WorkspaceForm({
  workspaceId,
  workspace,
  isAdmin,
}: {
  workspaceId: string;
  workspace: { name: string; logoUrl: string | null; plan: WorkspacePlan };
  isAdmin: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(workspace.name);
  const [logoPreview, setLogoPreview] = useState<string | null>(workspace.logoUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function revokePreview(url: string | null) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Formato inválido. Envie PNG, JPG, SVG ou WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError("O arquivo excede o tamanho máximo de 2MB.");
      event.target.value = "";
      return;
    }

    setFileError(null);
    const compressed = await compressImage(file);
    setPendingFile(compressed);
    setLogoRemoved(false);
    setLogoPreview((prev) => {
      revokePreview(prev);
      return URL.createObjectURL(compressed);
    });
    event.target.value = "";
  }

  function handleRemoveLogo() {
    setPendingFile(null);
    setLogoRemoved(true);
    setLogoPreview((prev) => {
      revokePreview(prev);
      return null;
    });
  }

  async function handleSave() {
    setStatus("saving");
    setServerError(null);

    const formData = new FormData();
    formData.set("workspaceId", workspaceId);
    formData.set("name", name);
    formData.set("removeLogo", String(logoRemoved));
    if (pendingFile) formData.set("logo", pendingFile);

    const result = await updateWorkspace(formData);

    if (result.status === "error") {
      setStatus("idle");
      setServerError(result.message);
      return;
    }

    setStatus("saved");
    setPendingFile(null);
    setLogoRemoved(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workspace</CardTitle>
        <CardDescription>
          Nome e identidade visual exibidos na sidebar e nos e-mails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "saved" && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Alterações salvas.</AlertDescription>
          </Alert>
        )}
        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <div className="bg-secondary/40 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="Logo do workspace"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!isAdmin}
                onClick={() => fileInputRef.current?.click()}
              >
                Enviar logo
              </Button>
              {logoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!isAdmin}
                  onClick={handleRemoveLogo}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG ou WebP · máximo 2MB</p>
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="workspace-name">Nome do workspace</Label>
          <Input
            id="workspace-name"
            value={name}
            disabled={!isAdmin}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        {!isAdmin && (
          <p className="text-xs text-muted-foreground">
            Só administradores podem editar o workspace.
          </p>
        )}

        <Button onClick={handleSave} disabled={!isAdmin || status === "saving"}>
          {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </CardContent>
    </Card>
  );
}
