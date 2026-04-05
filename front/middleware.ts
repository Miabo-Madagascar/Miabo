/**
 * Middleware Next.js — deux responsabilités :
 * 1. Détection de locale (fr / mg) via next-intl
 * 2. Protection des routes (dashboard) via session Supabase
 *
 * TODO PHASE 1 : implémenter quand @supabase/ssr et next-intl sont installés.
 */

import { type NextRequest, NextResponse } from "next/server"

// Routes protégées — rediriger vers /login si pas de session
const PROTECTED_PREFIXES = [
  "/fr/dashboard",
  "/mg/dashboard",
]

// Locales supportées
const LOCALES = ["fr", "mg"] as const
const DEFAULT_LOCALE = "fr"

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Redirection racine → locale par défaut
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
  }

  // Vérifier si la route est protégée
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isProtected) {
    // TODO PHASE 1 : vérifier la session Supabase SSR
    // const supabase = createServerClient(...)
    // const { data: { session } } = await supabase.auth.getSession()
    // if (!session) return NextResponse.redirect(new URL(`/${locale}/auth/login`, ...))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclure les assets statiques et les API routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
