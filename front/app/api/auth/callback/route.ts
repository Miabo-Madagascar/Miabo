/**
 * Route Handler — callback Supabase après confirmation email.
 *
 * Flux :
 *  1. L'utilisateur clique sur le lien de confirmation dans son email
 *  2. Supabase redirige vers /api/auth/callback?code=xxx
 *  3. On échange le code contre une session (PKCE)
 *  4. On appelle POST /auth/register sur FastAPI pour créer/valider le profil
 *  5. On redirige vers le dashboard
 *
 * Les données d'inscription (full_name, role, locale) sont lues depuis
 * le cookie "miabo_pending_register" posé par RegisterForm au moment
 * de l'inscription.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BACKEND_URL = process.env.API_URL ?? "http://127.0.0.1:8000"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Lire la locale depuis le cookie ou fallback "fr"
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? "fr"
  const dashboardUrl = `${origin}/${locale}/dashboard`
  const loginUrl     = `${origin}/${locale}/auth/login`

  if (!code) {
    console.error("[callback] Pas de code dans l'URL")
    return NextResponse.redirect(`${loginUrl}?error=no_code`)
  }

  const supabase = await createClient()

  // Échange le code contre une session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) {
    console.error("[callback] Erreur échange code:", error?.message)
    return NextResponse.redirect(`${loginUrl}?error=code_exchange_failed`)
  }

  const { session } = data

  // Récupérer les données d'inscription depuis le cookie
  const pendingRaw  = request.cookies.get("miabo_pending_register")?.value
  let pendingData: { full_name?: string; role?: string; locale?: string } = {}
  if (pendingRaw) {
    try { pendingData = JSON.parse(decodeURIComponent(pendingRaw)) } catch { /* ignoré */ }
  }

  // Appeler POST /auth/register pour créer le profil en BDD.
  // Si le profil existe déjà (409 par le trigger PostgreSQL) → on continue.
  try {
    const registerRes = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        token:     session.access_token,
        email:     session.user.email ?? "",
        full_name: pendingData.full_name ?? session.user.user_metadata?.full_name ?? "Utilisateur",
        role:      pendingData.role     ?? session.user.user_metadata?.role       ?? "student",
        locale:    pendingData.locale   ?? locale,
      }),
    })

    if (!registerRes.ok && registerRes.status !== 409) {
      const body = await registerRes.json().catch(() => ({}))
      console.error("[callback] Erreur POST /auth/register:", registerRes.status, body)
      // On continue quand même — le fallback dans dependencies.py prendra le relais
    }
  } catch (err) {
    console.error("[callback] Impossible de joindre le backend:", err)
    // On continue quand même
  }

  // Supprimer le cookie temporaire d'inscription
  const response = NextResponse.redirect(dashboardUrl)
  response.cookies.delete("miabo_pending_register")
  return response
}
