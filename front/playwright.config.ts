/**
 * Configuration Playwright — tests E2E MIABO.
 * Navigateur : Chromium uniquement (CI + local).
 */

import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  // Répertoire des tests E2E
  testDir: "./e2e",
  // Timeout global par test
  timeout: 30_000,
  // Timeout pour les assertions
  expect: { timeout: 5_000 },
  // Parallélisme désactivé pour éviter les conflits de sessions
  fullyParallel: false,
  // Échec rapide en CI
  forbidOnly: !!process.env.CI,
  // 1 retry en CI
  retries: process.env.CI ? 1 : 0,
  // 1 worker en CI, auto en local
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    // URL de base — doit correspondre au serveur Next.js démarré
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    // Capture d'écran uniquement en cas d'échec
    screenshot: "only-on-failure",
    // Vidéo uniquement en cas d'échec
    video: "retain-on-failure",
    // Trace en cas d'échec
    trace: "retain-on-failure",
    // Locale par défaut
    locale: "fr-FR",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Démarrage automatique du serveur Next.js si non déjà lancé
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,
  // },
})
