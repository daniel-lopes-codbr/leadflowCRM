import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function toCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => toCsvValue(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(request: Request, { params }: { params: { workspaceId: string } }) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("workspace_id", params.workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "admin") {
    return NextResponse.json(
      { error: "Só administradores podem exportar dados." },
      { status: 403 }
    );
  }

  const [{ data: leads }, { data: deals }, { data: activities }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, email, phone, company, role, status, owner_id, created_at")
      .eq("workspace_id", params.workspaceId),
    supabase
      .from("deals")
      .select("id, title, value, status, lead_id, owner_id, deadline, created_at")
      .eq("workspace_id", params.workspaceId),
    supabase
      .from("activities")
      .select("id, lead_id, type, description, author_id, occurred_at")
      .eq("workspace_id", params.workspaceId),
  ]);

  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    workspace_id: params.workspaceId,
    actor_id: user.id,
    event_type: "data.exported",
    metadata: { format },
  });

  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    const body = JSON.stringify({ leads, deals, activities }, null, 2);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="leadflow-export-${timestamp}.json"`,
      },
    });
  }

  // CSV cobre a tabela de leads — é onde vive o dado pessoal (nome, e-mail,
  // telefone) que a LGPD tem em vista; deals/activities já saem completos
  // no export em JSON, que serve pra portabilidade total dos dados.
  return new NextResponse(toCsv(leads ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leadflow-leads-${timestamp}.csv"`,
    },
  });
}
