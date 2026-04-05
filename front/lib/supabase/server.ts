/**
 * Client Supabase — côté serveur (Server Components, Route Handlers).
 * Gère les cookies pour la persistance de session SSR.
 * Usage : import { createClient } from "@/lib/supabase/server"
 *
 * TODO PHASE 1 : installer @supabase/ssr puis décommenter.
 */

// import { createServerClient } from "@supabase/ssr"
// import { cookies } from "next/headers"

// export async function createClient() {
//   const cookieStore = await cookies()
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll()        { return cookieStore.getAll() },
//         setAll(toSet)   { try { toSet.forEach(({ name, value, options }) =>
//                             cookieStore.set(name, value, options)) } catch {} },
//       },
//     }
//   )
// }
