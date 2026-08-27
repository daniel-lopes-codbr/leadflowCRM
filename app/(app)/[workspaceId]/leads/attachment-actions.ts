"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AttachmentActionResult = { status: "success" } | { status: "error"; message: string };
export type AttachmentDownloadResult =
  | { status: "success"; url: string }
  | { status: "error"; message: string };

const BUCKET = "lead-attachments";

// Espelha o file_size_limit/allowed_mime_types já configurados no bucket
// (migration) — validar aqui também dá uma mensagem de erro amigável antes
// de gastar uma chamada de rede pro Storage rejeitar o arquivo.
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

async function requireUser(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function revalidateLead(workspaceId: string, leadId: string) {
  revalidatePath(`/${workspaceId}/leads/${leadId}`);
}

// Sanitiza o nome original só o suficiente pra virar um path de Storage
// seguro — o nome de exibição continua o original, guardado à parte na
// tabela attachments.
function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadAttachment(
  workspaceId: string,
  leadId: string,
  formData: FormData
): Promise<AttachmentActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecione um arquivo." };
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      status: "error",
      message: "Formato não aceito. Envie PDF, imagem (PNG/JPEG/WebP), Word ou Excel.",
    };
  }

  if (file.size > MAX_BYTES) {
    return { status: "error", message: "O arquivo excede o tamanho máximo de 10MB." };
  }

  const path = `${workspaceId}/${leadId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { status: "error", message: "Não foi possível enviar o arquivo." };
  }

  const { error: insertError } = await supabase.from("attachments").insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    name: file.name,
    content_type: file.type,
    size_bytes: file.size,
    storage_path: path,
    author_id: user.id,
  });

  if (insertError) {
    // Órfão no Storage sem registro na tabela é pior que falhar limpo —
    // tenta remover o arquivo já enviado antes de reportar o erro.
    await supabase.storage.from(BUCKET).remove([path]);
    return { status: "error", message: "Não foi possível registrar o anexo." };
  }

  revalidateLead(workspaceId, leadId);
  return { status: "success" };
}

export async function deleteAttachment(
  workspaceId: string,
  leadId: string,
  attachmentId: string
): Promise<AttachmentActionResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { data: attachment } = await supabase
    .from("attachments")
    .select("storage_path")
    .eq("id", attachmentId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!attachment) {
    return { status: "error", message: "Anexo não encontrado." };
  }

  const { error: deleteError } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("workspace_id", workspaceId);

  if (deleteError) {
    return { status: "error", message: "Não foi possível excluir o anexo." };
  }

  await supabase.storage.from(BUCKET).remove([attachment.storage_path]);

  revalidateLead(workspaceId, leadId);
  return { status: "success" };
}

export async function getAttachmentDownloadUrl(
  workspaceId: string,
  attachmentId: string
): Promise<AttachmentDownloadResult> {
  const supabase = createClient();
  const user = await requireUser(supabase);
  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { data: attachment } = await supabase
    .from("attachments")
    .select("storage_path, name")
    .eq("id", attachmentId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!attachment) {
    return { status: "error", message: "Anexo não encontrado." };
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(attachment.storage_path, 60, { download: attachment.name });

  if (error || !data) {
    return { status: "error", message: "Não foi possível gerar o link de download." };
  }

  return { status: "success", url: data.signedUrl };
}
