/**
 * Middleware Next.js — deux responsabilités :
 * 1. Refresh de la session Supabase (obligatoire avec @supabase/ssr)
 * 2. Protection des routes : toute route non publique redirige vers login
 *
 * Logique de protection :
 * - Routes PUBLIQUES explicites : /, /{locale}, /{locale}/auth/*
 * - Appels API proxy : /api/* → laissés passer sans toucher
 * - Tout le reste sous /{locale}/* → protégé, redirige vers login si non connecté
 */

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const LOCALES        = ["fr", "mg"] as const
const DEFAULT_LOCALE = "fr"

/** Retourne true si le chemin est public (pas besoin d'être connecté). */
function isPublicPath(pathname: string): boolean {
  // Appels API proxy — ne jamais rediriger
  if (pathname.startsWith("/api/")) return true

  // Fichiers statiques Next.js
  if (pathname.startsWith("/_next/")) return true

  // Racine → redirigée vers /{locale} dans la suite
  if (pathname === "/") return true

  for (const loc of LOCALES) {
    // Page d'accueil locale (/fr, /mg)
    if (pathname === `/${loc}`) return true

    // Pages auth (/fr/auth/login, /fr/auth/register)
    if (pathname.startsWith(`/${loc}/auth/`)) return true
  }

  return false
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // ── Redirection racine → locale par défaut ────────────────────────────
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
  }

  // ── Routes publiques — laisser passer sans auth check ─────────────────
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // ── Ajout de locale manquante ──────────────────────────────────────────
  const hasLocale = LOCALES.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  )
  // Ignore les chemins sans extension qui n'ont pas de locale
  if (!hasLocale && !pathname.includes(".")) {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
    )
  }

  const locale = LOCALES.find((loc) => pathname.startsWith(`/${loc}`)) ?? DEFAULT_LOCALE

  // ── Supabase SSR — refresh du token dans les cookies ──────────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchit le token si expiré (NE PAS supprimer)
  const { data: { user } } = await supabase.auth.getUser()

  // ── Redirection si non connecté ────────────────────────────────────────
  if (!user) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url)
    loginUrl.searchParams.set("next", pathname)   // retour après login
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirection si déjà connecté et tente d'accéder à auth ────────────
  // (sécurité supplémentaire — le client gère aussi ce cas)
  if (user && pathname.includes("/auth/")) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return response
}

export const config = {
  // Exclut les fichiers statiques et images du middleware
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
