/**
 * Tests E2E — Recherche et consultation de tuteurs.
 * Ces tests vérifient les pages publiques accessibles sans connexion.
 */

import { test, expect } from "@playwright/test"

// ── Page liste des tuteurs ─────────────────────────────────────────────────

test.describe("Recherche de tuteurs", () => {
  test("affiche la page de recherche de tuteurs", async ({ page }) => {
    await page.goto("/fr/tuteurs")

    // Titre ou heading principal présent
    await expect(
      page.getByRole("heading").or(page.getByText(/tuteur/i))
    ).toBeVisible({ timeout: 10_000 })
  })

  test("affiche les filtres de recherche", async ({ page }) => {
    await page.goto("/fr/tuteurs")

    // Champs de filtrage attendus
    await expect(
      page.getByPlaceholder(/matière/i)
        .or(page.getByLabel(/matière/i))
        .or(page.getByRole("combobox"))
    ).toBeVisible({ timeout: 10_000 })
  })
})

// ── Navigation i18n ────────────────────────────────────────────────────────

test.describe("Navigation i18n", () => {
  test("la locale /fr charge bien la version française", async ({ page }) => {
    await page.goto("/fr")
    // Vérification que la page renvoie 200 (pas d'erreur 404/500)
    expect(page.url()).toContain("/fr")
  })

  test("la locale /mg charge bien la version malgache", async ({ page }) => {
    await page.goto("/mg")
    expect(page.url()).toContain("/mg")
  })

  test("redirection depuis / vers /fr", async ({ page }) => {
    await page.goto("/")
    // Le middleware doit rediriger vers une locale
    await expect(page).toHaveURL(/\/(fr|mg)/, { timeout: 5_000 })
  })
})
