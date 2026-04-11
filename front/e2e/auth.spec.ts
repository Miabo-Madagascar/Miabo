/**
 * Tests E2E — Authentification (connexion / déconnexion / inscription).
 * Ces tests vérifient le flux d'authentification via l'interface utilisateur.
 */

import { test, expect } from "@playwright/test"

// ── Navigation vers la page de connexion ───────────────────────────────────

test.describe("Page de connexion", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/fr/auth/login")

    // Logo MIABO présent
    await expect(page.getByRole("link", { name: "MIABO" })).toBeVisible()
    // Champs email et mot de passe
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    // Bouton de soumission
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible()
  })

  test("affiche le lien vers l'inscription", async ({ page }) => {
    await page.goto("/fr/auth/login")
    await expect(page.getByRole("link", { name: /créer un compte/i })).toBeVisible()
  })

  test("affiche une erreur avec des identifiants invalides", async ({ page }) => {
    await page.goto("/fr/auth/login")

    await page.getByLabel(/email/i).fill("inexistant@test.mg")
    await page.getByLabel(/mot de passe/i).fill("motdepasseincorrect")
    await page.getByRole("button", { name: /se connecter/i }).click()

    // Message d'erreur attendu
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 })
  })

  test("redirige vers la page d'accueil racine", async ({ page }) => {
    await page.goto("/fr/auth/login")
    // Vérification que le lien MIABO renvoie vers la page d'accueil
    const homeLink = page.getByRole("link", { name: "MIABO" })
    await expect(homeLink).toHaveAttribute("href", /\/fr$/)
  })
})

// ── Page d'inscription ─────────────────────────────────────────────────────

test.describe("Page d'inscription", () => {
  test("affiche le formulaire d'inscription", async ({ page }) => {
    await page.goto("/fr/auth/register")

    await expect(page.getByLabel(/nom complet/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
  })

  test("affiche une erreur si le mot de passe est trop court", async ({ page }) => {
    await page.goto("/fr/auth/register")

    await page.getByLabel(/nom complet/i).fill("Test Utilisateur")
    await page.getByLabel(/email/i).fill("nouveau@test.mg")
    await page.getByLabel(/mot de passe/i).fill("123")
    await page.getByRole("button", { name: /s'inscrire/i }).click()

    // Validation côté client ou message d'erreur
    const error = page.getByRole("alert").or(page.locator("[data-error]"))
    await expect(error).toBeVisible({ timeout: 5_000 })
  })
})

// ── Accès aux routes protégées sans authentification ───────────────────────

test.describe("Protection des routes", () => {
  test("redirige /fr/eleve vers la connexion si non authentifié", async ({ page }) => {
    await page.goto("/fr/eleve")
    // Middleware doit rediriger vers /fr/auth/login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test("redirige /fr/tuteur vers la connexion si non authentifié", async ({ page }) => {
    await page.goto("/fr/tuteur")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test("redirige /fr/canope vers la connexion si non authentifié", async ({ page }) => {
    await page.goto("/fr/canope")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test("redirige /fr/admin vers la connexion si non authentifié", async ({ page }) => {
    await page.goto("/fr/admin")
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })
})
