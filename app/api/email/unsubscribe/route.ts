import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml } from "@/lib/utils";

// Rota pública (sem sessão) — o link vive no rodapé de e-mails transacionais.
// Reaproveita o token do convite como credencial: só quem recebeu aquele
// e-mail específico tem esse valor.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new NextResponse("Link inválido.", { status: 400 });
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invites")
    .select("email")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return new NextResponse("Link inválido ou expirado.", { status: 404 });
  }

  await admin.from("email_opt_outs").upsert({ email: invite.email.toLowerCase() });

  return new NextResponse(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" /><title>Descadastro · LeadFlow CRM</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#1e293b;"><h1 style="font-size:20px;">Descadastro confirmado</h1><p><strong>${escapeHtml(invite.email)}</strong> não vai mais receber e-mails do LeadFlow CRM.</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
