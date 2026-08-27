import { NextResponse } from "next/server";
import { startOfUtcDayIso } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, FROM_EMAIL } from "@/lib/resend/client";
import { escapeHtml } from "@/lib/utils";

// Disparado uma vez por dia pelo Vercel Cron (ver vercel.json). Vercel injeta
// o header Authorization com CRON_SECRET automaticamente quando essa env var
// está configurada — mesma verificação usada por qualquer outra chamada
// externa não-autenticada por sessão (padrão do webhook do Stripe).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: followUpRows, error } = await admin
    .from("activities")
    .select("id, description, type, scheduled_at, lead_id, leads(name, owner_id)")
    .gte("scheduled_at", startOfUtcDayIso())
    .lt("scheduled_at", startOfUtcDayIso(1))
    .is("completed_at", null)
    .is("canceled_at", null);

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar follow-ups." }, { status: 500 });
  }

  type FollowUpRow = {
    description: string;
    type: string;
    scheduledAt: string;
    leadName: string;
    ownerId: string;
  };

  const byOwner = new Map<string, FollowUpRow[]>();
  for (const row of followUpRows ?? []) {
    const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
    if (!lead?.owner_id) continue;
    const list = byOwner.get(lead.owner_id) ?? [];
    list.push({
      description: row.description,
      type: row.type,
      scheduledAt: row.scheduled_at,
      leadName: lead.name,
      ownerId: lead.owner_id,
    });
    byOwner.set(lead.owner_id, list);
  }

  if (byOwner.size === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: owners } = await admin
    .from("profiles")
    .select("id, name, email")
    .in("id", [...byOwner.keys()]);

  const resend = createResendClient();
  let sent = 0;

  for (const [ownerId, items] of byOwner) {
    const owner = owners?.find((o) => o.id === ownerId);
    if (!owner?.email) continue;

    const itemsHtml = items
      .map((item) => {
        const time = new Date(item.scheduledAt).toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
        });
        return `<li><strong>${escapeHtml(item.leadName)}</strong> — ${time} · ${escapeHtml(item.type)}: ${escapeHtml(item.description)}</li>`;
      })
      .join("");

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: owner.email,
        subject: `Você tem ${items.length} follow-up${items.length > 1 ? "s" : ""} para hoje`,
        html: `<p>Olá, ${escapeHtml(owner.name)}!</p><p>Follow-ups agendados para hoje:</p><ul>${itemsHtml}</ul>`,
      });
      sent++;
    } catch {
      // Um envio falhando (ex.: Resend fora do ar) não deve derrubar os
      // demais — segue tentando o próximo responsável.
      continue;
    }
  }

  return NextResponse.json({ sent });
}
