"use client"
/**
 * Hook useAuth — session Supabase + profil FastAPI.
 * Source unique de vérité pour l'état d'authentification.
 * Utilise le singleton Supabase et le client API centralisé.
 */

import { useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { api, ApiError } from "@/lib/api/client"
import type { Profile } from "@/types"
import type { UserRole } from "@/types"

interface AuthState {
  user:      User | null
  session:   Session | null
  profile:   Profile | null
  role:      UserRole | null
  isLoading: boolean
}

interface UseAuthReturn extends AuthState {
  signOut:        () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const supabase = createClient()

  const [state, setState] = useState<AuthState>({
    user:      null,
    session:   null,
    profile:   null,
    role:      null,
    isLoading: true,
  })

  // Charge le profil depuis FastAPI via le client centralisé
  const loadProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      return await api.get<Profile>("/profiles/me")
    } catch (err) {
      // 401 = pas encore connecté — pas une erreur à logger
      if (err instanceof ApiError && err.status === 401) return null
      console.error("[useAuth] Erreur chargement profil:", err)
      return null
    }
  }, [])

  const applySession = useCallback(async (session: Session | null) => {
    // Le client API récupère maintenant le token directement via getSession()
    // pour éviter les race conditions avec un cache en mémoire.
    const profile = session ? await loadProfile() : null
    setState({
      user:      session?.user ?? null,
      session,
      profile,
      role:      (profile?.role ?? null) as UserRole | null,
      isLoading: false,
    })
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    const profile = await loadProfile()
    setState((prev) => ({
      ...prev,
      profile,
      role: (profile?.role ?? null) as UserRole | null,
    }))
  }, [loadProfile])

  useEffect(() => {
    // Session initiale depuis les cookies/localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session)
    })

    // Changements de session : login, logout, refresh du token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => { applySession(session) }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  return { ...state, signOut, refreshProfile }
}
