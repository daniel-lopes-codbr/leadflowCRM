import { randomUUID } from "node:crypto";

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const TEST_PASSWORD = "PlaywrightTest!12345";

function adminHeaders() {
  return {
    apikey: SERVICE,
    Authorization: `Bearer ${SERVICE}`,
    "Content-Type": "application/json",
  };
}

export async function createDisposableUser(prefix: string) {
  const email = `${prefix}-${randomUUID()}@leadflow-test.dev`;
  const res = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ email, password: TEST_PASSWORD, email_confirm: true }),
  });
  const user = await res.json();
  if (!res.ok) throw new Error(`create user failed: ${JSON.stringify(user)}`);
  return { id: user.id as string, email: email as string, password: TEST_PASSWORD };
}

export async function deleteDisposableUser(userId: string) {
  await fetch(`${URL_BASE}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

export async function adminRest(
  method: string,
  path: string,
  body?: unknown,
  prefer = "return=representation"
) {
  const res = await fetch(`${URL_BASE}/rest/v1${path}`, {
    method,
    headers: { ...adminHeaders(), Prefer: prefer },
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
}

/** Cria workspace + membership admin pro usuário, direto no banco (via
 * service_role) — mais rápido e menos flaky que passar pelo onboarding na
 * UI quando o teste só precisa de um workspace pronto pra usar. */
export async function createWorkspaceForUser(userId: string, name: string) {
  const workspaceId = randomUUID();
  await adminRest("POST", "/workspaces", { id: workspaceId, name }, "return=minimal");
  await adminRest("POST", "/memberships", { workspace_id: workspaceId, user_id: userId, role: "admin" });
  return workspaceId;
}

export async function deleteWorkspaceCascade(workspaceId: string) {
  await adminRest("DELETE", `/memberships?workspace_id=eq.${workspaceId}`);
  await adminRest("DELETE", `/leads?workspace_id=eq.${workspaceId}`);
  await adminRest("DELETE", `/deals?workspace_id=eq.${workspaceId}`);
  await adminRest("DELETE", `/workspaces?id=eq.${workspaceId}`);
}
