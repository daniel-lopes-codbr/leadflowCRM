"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  uploadAttachment,
} from "@/app/(app)/[workspaceId]/leads/attachment-actions";
import type { Attachment } from "@/types/attachment";

// Espelha o file_size_limit/allowed_mime_types do bucket (migration) —
// checar aqui dá feedback instantâneo sem round-trip ao servidor, mas o
// servidor valida de novo (nunca confiar só no client).
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsList({
  workspaceId,
  leadId,
  attachments,
}: {
  workspaceId: string;
  leadId: string;
  attachments: Attachment[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato não aceito. Envie PDF, imagem (PNG/JPEG/WebP), Word ou Excel.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("O arquivo excede o tamanho máximo de 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    const result = await uploadAttachment(workspaceId, leadId, formData);
    setUploading(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    router.refresh();
  }

  async function handleDownload(attachment: Attachment) {
    setError(null);
    setDownloadingId(attachment.id);
    const result = await getAttachmentDownloadUrl(workspaceId, attachment.id);
    setDownloadingId(null);
    if (result.status === "success") {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setError(result.message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAttachment(workspaceId, leadId, deleteTarget.id);
    setDeleting(false);
    if (result.status === "success") {
      setDeleteTarget(null);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Documentos</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Enviar arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileChange}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-xs text-destructive">{error}</p>}

        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento anexado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {attachment.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatBytes(attachment.sizeBytes)} · {attachment.authorName} ·{" "}
                      {new Date(attachment.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(attachment)}
                    disabled={downloadingId === attachment.id}
                  >
                    {downloadingId === attachment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Baixar"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Excluir ${attachment.name}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(attachment)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo será removido permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
