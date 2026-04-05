/**
 * Client Supabase — côté navigateur uniquement (Client Components).
 *
 * Singleton : une seule instance partagée.
 * Token cache : mis à jour par useAuth via setAccessToken().
 * Le cache est pré-rempli dès la création du singleton via getSession()
 * pour éviter la race condition au premier rendu.
 */

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// ── Singleton client ─────────────────────────────────────────────────────────

let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    // Pré-remplir le cache du token dès la création
    _client.auth.getSession().then(({ data: { session } }) => {
      _accessToken = session?.access_token ?? null
    })
  }
  return _client
}

// ── Cache du token d'accès ───────────────────────────────────────────────────

let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}
