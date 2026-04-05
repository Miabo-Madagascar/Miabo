"use client"
/**
 * SessionListClient — liste des sessions de l'utilisateur connecté.
 */

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { SessionCard } from "./SessionCard"
import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/types"

interface SessionListClientProps {
  locale: string
}

type ViewRole = "student" | "tutor" | "parent" | "admin"

export function SessionListClient({ locale }: SessionListClientProps) {
  const { profile } = useAuth()
  const supabase    = createClient()

  const [sessions,  setSessions]  = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) throw new Error("Non connecté")

        const res = await fetch("/api/backend/sessions/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur de chargement")
        setSessions(await res.json())
      } catch {
        setError("Impossible de charger vos sessions.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [supabase])

  const viewAs: ViewRole =
    (profile?.role as ViewRole | undefined) ?? "student"

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">
        {error}
      </p>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-default)] p-10 text-center text-[var(--text-secondary)]">
        Aucune session pour le moment.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} locale={locale} viewAs={viewAs} />
      ))}
    </div>
  )
}
