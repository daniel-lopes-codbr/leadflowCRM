import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Node não carrega .env.local sozinho fora do runtime do Next.js — os
// testes (E2E e RLS) precisam das mesmas chaves do Supabase que o app usa.
const envPath = path.join(__dirname, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    const value = /^(['"]).*\1$/.test(rawValue) ? rawValue.slice(1, -1) : rawValue;
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  // Suíte pequena, todos os testes batem no mesmo dev server local — rodar
  // em série evita contenção de recursos (o teste de drag-and-drop do
  // Kanban é sensível a timing e ficou flaky sob 4 workers simultâneos).
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
