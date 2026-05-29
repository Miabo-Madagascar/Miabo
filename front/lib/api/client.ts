/**
 * Client HTTP FastAPI — unique source de vérité pour tous les appels API.
 * - Gère le token Supabase automatiquement (lecture directe depuis getSession)
 * - Lance une ApiError typée en cas d'échec
 * - Utilise le proxy Next.js (/api/backend/*) — jamais d'URL backend directe
 *
 * Usage : import { api } from "@/lib/api/client"
 *   api.get<Session[]>("/sessions/")
 *   api.post<Payment>("/payments/mvola/initiate", { ... })
 */

import { createClient } from "@/lib/supabase/client"

const API_BASE = "/api/backend"

// ── Erreur typée ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status:  number,
    public readonly detail:  string,
  ) {
    super(detail)
    this.name = "ApiError"
  }
}

// ── Token Supabase ──────────────────────────────────────────────────────────
// Lecture directe depuis les cookies via getSession() — source de vérité,
// indépendante du cache _accessToken de useAuth (évite la race condition).

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

// ── Fetch central ───────────────────────────────────────────────────────────

async function request<T>(
  path:    string,
  options: RequestInit = {},
  auth     = true,      // false uniquement pour les routes publiques
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (auth) {
    const token = await getToken()
    if (!token) {
      // Redirige vers login si pas de session — évite un 401 silencieux
      if (typeof window !== "undefined") {
        const locale = window.location.pathname.split("/")[1] ?? "fr"
        window.location.href = `/${locale}/auth/login`
      }
      throw new ApiError(401, "Non authentifié — redirection vers login")
    }
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = `Erreur ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch { /* réponse non-JSON */ }
    throw new ApiError(res.status, detail)
  }

  // 204 No Content → retourner null
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

// ── API client exporté ──────────────────────────────────────────────────────

export const api = {
  /** GET authentifié */
  get: <T>(path: string) =>
    request<T>(path, { method: "GET" }),

  /** GET public (pas de token requis) */
  getPublic: <T>(path: string) =>
    request<T>(path, { method: "GET" }, false),

  /** POST authentifié */
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  /** PUT authentifié */
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  /** DELETE authentifié */
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),

  /**
   * POST authentifié qui retourne la Response brute (streaming SSE).
   * À utiliser quand le corps de la réponse doit être lu progressivement.
   */
  postStream: async (path: string): Promise<Response> => {
    const token = await getToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`
    return fetch(`${API_BASE}${path}`, { method: "POST", headers })
  },
}
