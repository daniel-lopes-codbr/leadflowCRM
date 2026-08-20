"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockWorkspace } from "@/components/settings/data";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export function WorkspaceForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(mockWorkspace.name);
  const [logoPreview, setLogoPreview] = useState<string | null>(mockWorkspace.logoUrl);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Formato inválido. Envie PNG, JPG, SVG ou WebP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError("O arquivo excede o tamanho máximo de 2MB.");
      return;
    }

    setFileError(null);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setStatus("saving");
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus("saved");
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
            <AlertDescription>
              Alterações salvas (mock — persistência chega no M13).
            </AlertDescription>
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
                onClick={() => fileInputRef.current?.click()}
              >
                Enviar logo
              </Button>
              {logoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoPreview(null)}
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
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </CardContent>
    </Card>
  );
}
