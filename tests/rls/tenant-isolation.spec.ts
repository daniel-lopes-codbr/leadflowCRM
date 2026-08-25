import { expect, test } from "@playwright/test";
import {
  adminRest,
  createDisposableUser,
  createWorkspaceForUser,
  deleteDisposableUser,
  deleteWorkspaceCascade,
} from "../helpers/supabase-admin";

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function signIn(email: string, password: string) {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`sign in failed: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

function userRest(token: string) {
  return async (method: string, path: string, body?: unknown, prefer = "return=representation") => {
    const res = await fetch(`${URL_BASE}/rest/v1${path}`, {
      method,
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: prefer,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  };
}

// Regressão do isolamento de tenant via RLS: um usuário fora do workspace
// (outsider) não deve ler nem escrever nada nele, em nenhuma tabela
// escopada por workspace_id — direto contra o Postgres real, sem mock.
test.describe("Isolamento de tenant via RLS", () => {
  let owner: Awaited<ReturnType<typeof createDisposableUser>>;
  let outsider: Awaited<ReturnType<typeof createDisposableUser>>;
  let ownerToken: string;
  let outsiderToken: string;
  let workspaceId: string;
  let leadId: string;

  test.beforeAll(async () => {
    owner = await createDisposableUser("rls-owner");
    outsider = await createDisposableUser("rls-outsider");
    ownerToken = await signIn(owner.email, owner.password);
    outsiderToken = await signIn(outsider.email, outsider.password);
    workspaceId = await createWorkspaceForUser(owner.id, `RLS Test WS ${Date.now()}`);

    const asOwner = userRest(ownerToken);
    const lead = await asOwner("POST", "/leads", {
      workspace_id: workspaceId,
      name: "RLS Lead",
      status: "Novo Lead",
    });
    leadId = (lead.data as { id: string }[])[0].id;
  });

  test.afterAll(async () => {
    await deleteWorkspaceCascade(workspaceId);
    await deleteDisposableUser(owner.id);
    await deleteDisposableUser(outsider.id);
  });

  test("owner enxerga o próprio lead", async () => {
    const res = await userRest(ownerToken)("GET", `/leads?id=eq.${leadId}`);
    expect(res.ok).toBe(true);
    expect((res.data as unknown[]).length).toBe(1);
  });

  test("outsider não lê leads de workspace alheio", async () => {
    const res = await userRest(outsiderToken)("GET", `/leads?workspace_id=eq.${workspaceId}`);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual([]);
  });

  test("outsider não consegue inserir lead em workspace alheio", async () => {
    const res = await userRest(outsiderToken)("POST", "/leads", {
      workspace_id: workspaceId,
      name: "Invasor",
      status: "Novo Lead",
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
  });

  test("outsider não consegue atualizar lead alheio (0 linhas afetadas)", async () => {
    const res = await userRest(outsiderToken)("PATCH", `/leads?id=eq.${leadId}`, {
      name: "Hackeado",
    });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual([]);

    const check = await adminRest("GET", `/leads?id=eq.${leadId}&select=name`);
    expect((check.data as { name: string }[])[0].name).toBe("RLS Lead");
  });

  test("outsider não consegue deletar lead alheio (0 linhas afetadas)", async () => {
    const res = await userRest(outsiderToken)("DELETE", `/leads?id=eq.${leadId}`);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual([]);

    const check = await adminRest("GET", `/leads?id=eq.${leadId}`);
    expect((check.data as unknown[]).length).toBe(1);
  });

  test("outsider não lê profile de membro de workspace alheio", async () => {
    const res = await userRest(outsiderToken)("GET", `/profiles?id=eq.${owner.id}`);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual([]);
  });

  test("outsider não lê deals nem activities de workspace alheio", async () => {
    const asOwner = userRest(ownerToken);
    await asOwner("POST", "/deals", {
      workspace_id: workspaceId,
      title: "RLS Deal",
      status: "Novo Lead",
    });
    await asOwner("POST", "/activities", {
      workspace_id: workspaceId,
      lead_id: leadId,
      type: "Nota",
      description: "RLS activity",
    });

    const asOutsider = userRest(outsiderToken);
    const deals = await asOutsider("GET", `/deals?workspace_id=eq.${workspaceId}`);
    const activities = await asOutsider("GET", `/activities?workspace_id=eq.${workspaceId}`);

    expect(deals.data).toEqual([]);
    expect(activities.data).toEqual([]);
  });
});
