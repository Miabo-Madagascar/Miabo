/**
 * Client HTTP FastAPI — wrapper autour de fetch().
 * Injecte automatiquement le JWT Supabase dans Authorization.
 *
 * TODO PHASE 1 : brancher createClient() Supabase pour récupérer le token.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface ApiError {
  detail: string
  status: number
}

async function getAuthHeader(): Promise<Record<string, string>> {
  // TODO : récupérer le token via supabase/client
  // const supabase = createClient()
  // const { data: { session } } = await supabase.auth.getSession()
  // if (session?.access_token) return { Authorization: `Bearer ${session.access_token}` }
  return {}
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeader = await getAuthHeader()

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur réseau" }))
    throw { detail: error.detail ?? "Erreur serveur", status: response.status } satisfies ApiError
  }

  return response.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                     => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown)      => apiFetch<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)      => apiFetch<T>(path, { method: "PUT",   body: JSON.stringify(body) }),
  delete: <T>(path: string)                     => apiFetch<T>(path, { method: "DELETE" }),
}
