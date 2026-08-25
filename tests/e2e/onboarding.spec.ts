import { expect, test } from "@playwright/test";
import { adminRest, createDisposableUser, deleteDisposableUser, TEST_PASSWORD } from "../helpers/supabase-admin";

test.describe("Onboarding", () => {
  let user: Awaited<ReturnType<typeof createDisposableUser>>;
  let workspaceId: string | undefined;

  test.afterEach(async () => {
    if (workspaceId) {
      await adminRest("DELETE", `/memberships?workspace_id=eq.${workspaceId}`);
      await adminRest("DELETE", `/workspaces?id=eq.${workspaceId}`);
      workspaceId = undefined;
    }
    if (user) await deleteDisposableUser(user.id);
  });

  test("login sem workspace cai no onboarding e cria workspace real", async ({ page }) => {
    user = await createDisposableUser("e2e-onboarding");

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(user.email);
    await page.getByLabel("Senha").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/onboarding");
    await expect(page.getByRole("heading", { name: "Crie seu workspace" })).toBeVisible();

    const workspaceName = `E2E WS ${Date.now()}`;
    await page.getByLabel("Nome do workspace").fill(workspaceName);
    await page.getByRole("button", { name: "Criar workspace" }).click();

    await page.waitForURL(/\/[0-9a-f-]{36}\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(workspaceName)).toBeVisible();

    workspaceId = page.url().match(/\/([0-9a-f-]{36})\/dashboard/)?.[1];
    expect(workspaceId).toBeTruthy();
  });
});
