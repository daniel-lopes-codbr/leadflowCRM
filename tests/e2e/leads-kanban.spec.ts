import { expect, test } from "@playwright/test";
import {
  createDisposableUser,
  createWorkspaceForUser,
  deleteDisposableUser,
  deleteWorkspaceCascade,
  TEST_PASSWORD,
} from "../helpers/supabase-admin";

test.describe("Leads e Pipeline", () => {
  let user: Awaited<ReturnType<typeof createDisposableUser>>;
  let workspaceId: string;

  test.beforeAll(async () => {
    user = await createDisposableUser("e2e-kanban");
    workspaceId = await createWorkspaceForUser(user.id, `E2E Kanban WS ${Date.now()}`);
  });

  test.afterAll(async () => {
    await deleteWorkspaceCascade(workspaceId);
    await deleteDisposableUser(user.id);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(user.email);
    await page.getByLabel("Senha").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(`**/${workspaceId}/dashboard`);
  });

  test("cria lead e negócio, e arrasta o negócio entre colunas do Kanban", async ({ page }) => {
    const leadName = `E2E Lead ${Date.now()}`;

    await page.goto(`/${workspaceId}/leads`);
    await page.getByRole("button", { name: "Novo lead" }).click();
    await page.getByLabel("Nome").fill(leadName);
    await page.getByLabel("E-mail").fill("e2e-lead@leadflow-test.dev");
    await page.getByLabel("Telefone").fill("11999999999");
    await page.getByLabel("Cargo").fill("CEO");
    await page.getByLabel("Empresa").fill("E2E Co");
    await page.getByRole("button", { name: "Criar lead" }).click();
    await expect(page.getByText(leadName)).toBeVisible();

    const dealTitle = `E2E Deal ${Date.now()}`;
    await page.goto(`/${workspaceId}/pipeline`);
    await page.getByRole("button", { name: "Novo negócio", exact: true }).click();
    await page.getByLabel("Título").fill(dealTitle);
    await page.getByLabel("Valor estimado (R$)").fill("1000");
    await page.getByLabel("Prazo").fill("2026-12-31");
    await page.getByRole("button", { name: "Criar negócio" }).click();
    await expect(page.getByText(dealTitle)).toBeVisible();

    const dealCard = page.getByText(dealTitle);
    const contatoColumn = page
      .locator("h3", { hasText: "Contato Realizado" })
      .locator("xpath=ancestor::div[contains(@class,'rounded-xl')]");

    const sourceBox = await dealCard.boundingBox();
    const targetBox = await contatoColumn.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("bounding box não encontrado");

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
      steps: 15,
    });
    await page.mouse.up();

    // persistência real: recarrega e confirma que o card ficou na nova coluna
    await page.reload();
    await expect(contatoColumn.getByText(dealTitle)).toBeVisible();
  });
});
