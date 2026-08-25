import { expect, test } from "@playwright/test";
import {
  createDisposableUser,
  createWorkspaceForUser,
  deleteDisposableUser,
  deleteWorkspaceCascade,
  TEST_PASSWORD,
} from "../helpers/supabase-admin";

test.describe("Billing", () => {
  let user: Awaited<ReturnType<typeof createDisposableUser>>;
  let workspaceId: string;

  test.beforeAll(async () => {
    user = await createDisposableUser("e2e-billing");
    workspaceId = await createWorkspaceForUser(user.id, `E2E Billing WS ${Date.now()}`);
  });

  test.afterAll(async () => {
    await deleteWorkspaceCascade(workspaceId);
    await deleteDisposableUser(user.id);
  });

  test("Assinar Pro redireciona pro Checkout do Stripe", async ({ page }) => {
    test.skip(!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO, "Stripe não configurado neste ambiente.");

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(user.email);
    await page.getByLabel("Senha").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(`**/${workspaceId}/dashboard`);

    await page.goto(`/${workspaceId}/settings?tab=plans`);
    await page.getByRole("button", { name: "Assinar Pro" }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
    expect(page.url()).toContain("checkout.stripe.com");
  });
});
