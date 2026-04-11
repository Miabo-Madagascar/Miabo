/**
 * Helpers E2E — fonctions d'authentification réutilisables.
 * Utilisées dans les tests qui nécessitent une session active.
 */

import { Page } from "@playwright/test"

interface LoginOptions {
  email:    string
  password: string
  locale?:  "fr" | "mg"
}

/**
 * Connecte un utilisateur via le formulaire de connexion.
 * Attend la redirection post-connexion avant de retourner.
 */
export async function login(page: Page, options: LoginOptions): Promise<void> {
  const { email, password, locale = "fr" } = options

  await page.goto(`/${locale}/auth/login`)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/mot de passe/i).fill(password)
  await page.getByRole("button", { name: /se connecter/i }).click()

  // Attente de la redirection post-connexion (dashboard)
  await page.waitForURL(/\/(eleve|tuteur|canope|cosp|parent|admin|dashboard)/, {
    timeout: 15_000,
  })
}

/**
 * Déconnecte l'utilisateur courant.
 */
export async function logout(page: Page, locale: "fr" | "mg" = "fr"): Promise<void> {
  // Clic sur le bouton de déconnexion (présent dans le layout dashboard)
  const logoutBtn = page.getByRole("button", { name: /déconnexion/i })
    .or(page.getByRole("link", { name: /déconnexion/i }))

  if (await logoutBtn.isVisible()) {
    await logoutBtn.click()
    await page.waitForURL(`/${locale}/auth/login`, { timeout: 10_000 })
  }
}

/**
 * Crée un état de stockage de session pour réutilisation entre tests.
 * À appeler dans un setup global Playwright.
 */
export async function saveStorageState(
  page: Page,
  options: LoginOptions,
  storagePath: string,
): Promise<void> {
  await login(page, options)
  await page.context().storageState({ path: storagePath })
}
