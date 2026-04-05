/**
 * Middleware Next.js — deux responsabilités :
 * 1. Refresh de la session Supabase (obligatoire avec @supabase/ssr)
 * 2. Protection des routes dashboard + redirection vers login si non connecté
 */

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const LOCALES         = ["fr", "mg"] as const
const DEFAULT_LOCALE  = "fr"
const PUBLIC_PATHS    = ["/auth/login", "/auth/register"]

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Redirection racine → locale par défaut
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
  }

  // Détection de locale — rediriger si absente
  const hasLocale = LOCALES.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  )
  if (!hasLocale && !pathname.startsWith("/_next") && !pathname.includes(".")) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url))
  }

  // Extraire la locale courante
  const locale = LOCALES.find((loc) => pathname.startsWith(`/${loc}`)) ?? DEFAULT_LOCALE

  // Créer le client Supabase SSR pour rafraîchir la session dans les cookies
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

  // Rafraîchit le token si expiré (IMPORTANT — ne pas supprimer)
  const { data: { user } } = await supabase.auth.getUser()

  // Vérifier si la route dashboard est protégée
  const isDashboard = pathname.includes("/(dashboard)") ||
    LOCALES.some((loc) => pathname.startsWith(`/${loc}/dashboard`) ||
      ["eleve","tuteur","parent","admin","canope","cosp"].some(
        (r) => pathname.startsWith(`/${loc}/${r}`)
      )
    )

  const isPublicAuth = PUBLIC_PATHS.some((p) =>
    LOCALES.some((loc) => pathname.startsWith(`/${loc}${p}`))
  )

  if (!user && isDashboard) {
    // Non connecté → login
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login`, request.url)
    )
  }

  if (user && isPublicAuth) {
    // Déjà connecté → dashboard
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
