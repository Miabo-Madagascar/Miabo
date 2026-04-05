/**
 * Client Supabase — côté navigateur (Client Components uniquement).
 * Usage : import { createClient } from "@/lib/supabase/client"
 * NE PAS utiliser dans les Server Components ou Route Handlers.
 */

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
