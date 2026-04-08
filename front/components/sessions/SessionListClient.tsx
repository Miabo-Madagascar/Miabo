"use client"
/**
 * SessionListClient — liste des sessions de l'utilisateur connecté.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { SessionCard } from "./SessionCard"
import { useAuth } from "@/hooks/useAuth"
import { SessionDetail } from "@/types"

interface SessionListClientProps {
  locale: string
}

type ViewRole = "student" | "tutor" | "parent" | "admin"

export function SessionListClient({ locale }: SessionListClientProps) {
  const { profile } = useAuth()

  const [sessions,  setSessions]  = useState<SessionDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.get<SessionDetail[]>("/sessions")
        setSessions(data)
      } catch (err) {
        const msg = err instanceof ApiError ? err.detail : "Impossible de charger vos sessions."
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleConfirm = async (session: { id: string }, accepted: boolean) => {
    setActionLoadingId(session.id)
    setError(null)
    try {
      await api.put(`/sessions/${session.id}/confirm`, { accepted })
      // Recharger les sessions après la modification
      const data = await api.get<SessionDetail[]>("/sessions")
      setSessions(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur inattendue")
    } finally {
      setActionLoadingId(null)
    }
  }

  const viewAs: ViewRole = (profile?.role as ViewRole | undefined) ?? "student"

  if (isLoading) return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
      ))}
    </div>
  )

  if (error) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">{error}</p>
  )

  if (sessions.length === 0) return (
    <div className="rounded-xl border border-dashed border-[var(--border-default)] p-10 text-center text-[var(--text-secondary)]">
      Aucune session pour le moment.
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => (
        <SessionCard 
          key={s.id} 
          session={s} 
          locale={locale} 
          viewAs={viewAs} 
          onConfirm={handleConfirm}
          isActionLoading={actionLoadingId === s.id}
        />
      ))}
    </div>
  )
}
