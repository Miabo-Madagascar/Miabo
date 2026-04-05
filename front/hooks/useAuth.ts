"use client"
/**
 * Hook useAuth — session Supabase, profil utilisateur, actions auth.
 * À utiliser uniquement dans les Client Components.
 */

import { useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
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
  signOut:   () => Promise<void>
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

  // Charge le profil depuis la BDD via FastAPI
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch("/api/backend/profiles/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      return (await res.json()) as Profile
    } catch {
      return null
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!state.user) return
    const profile = await loadProfile(state.user.id)
    setState((prev) => ({ ...prev, profile, role: (profile?.role ?? null) as UserRole | null }))
  }, [state.user, loadProfile])

  useEffect(() => {
    // Charge la session initiale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const profile = session ? await loadProfile(session.user.id) : null
      setState({
        user:      session?.user ?? null,
        session,
        profile,
        role:      (profile?.role ?? null) as UserRole | null,
        isLoading: false,
      })
    })

    // Ecoute les changements de session (login / logout / refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const profile = session ? await loadProfile(session.user.id) : null
        setState({
          user:      session?.user ?? null,
          session,
          profile,
          role:      (profile?.role ?? null) as UserRole | null,
          isLoading: false,
        })
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  return { ...state, signOut, refreshProfile }
}
