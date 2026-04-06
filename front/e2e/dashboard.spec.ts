/**
 * Tests E2E — Dashboards par rôle.
 * Ces tests utilisent des fixtures d'authentification stockées.
 * À activer après avoir généré les storageState via le setup global.
 */

import { test, expect } from "@playwright/test"

// ── Dashboard élève ────────────────────────────────────────────────────────

test.describe("Dashboard élève", () => {
  // Note : ces tests nécessitent une session élève active.
  // Décommenter et configurer storageState quand l'env de test est disponible.

  test.skip("affiche le dashboard élève après connexion", async ({ page }) => {
    await page.goto("/fr/eleve")

    await expect(page.getByRole("heading", { name: /tableau de bord/i }))
      .toBeVisible({ timeout: 10_000 })
  })

  test.skip("affiche les sessions de l'élève", async ({ page }) => {
    await page.goto("/fr/sessions")
    await expect(page.getByText(/mes sessions/i)).toBeVisible()
  })
})

// ── Dashboard tuteur ───────────────────────────────────────────────────────

test.describe("Dashboard tuteur", () => {
  test.skip("affiche le dashboard tuteur après connexion", async ({ page }) => {
    await page.goto("/fr/tuteur")
    await expect(
      page.getByRole("heading").filter({ hasText: /tuteur/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test.skip("accède à la gestion des disponibilités", async ({ page }) => {
    await page.goto("/fr/tuteur/disponibilites")
    await expect(page.getByText(/disponibilités/i)).toBeVisible()
  })
})

// ── Dashboard CANOPE ───────────────────────────────────────────────────────

test.describe("Dashboard CANOPE", () => {
  test.skip("affiche le dashboard CANOPE après connexion", async ({ page }) => {
    await page.goto("/fr/canope")
    await expect(
      page.getByRole("heading").filter({ hasText: /canope/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test.skip("accède à la liste des bilans", async ({ page }) => {
    await page.goto("/fr/canope/bilans")
    await expect(page.getByText(/bilans/i)).toBeVisible()
  })

  test.skip("accède aux ressources pédagogiques", async ({ page }) => {
    await page.goto("/fr/canope/ressources")
    await expect(page.getByText(/ressources/i)).toBeVisible()
  })
})

// ── Navigation inter-pages ─────────────────────────────────────────────────

test.describe("Navigation", () => {
  test("la page /fr/sessions redirige sans auth", async ({ page }) => {
    await page.goto("/fr/sessions")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test("la page /fr/wallet redirige sans auth", async ({ page }) => {
    await page.goto("/fr/wallet")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test("la page /fr/messages redirige sans auth", async ({ page }) => {
    await page.goto("/fr/messages")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test("la page /fr/profil redirige sans auth", async ({ page }) => {
    await page.goto("/fr/profil")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })
})
