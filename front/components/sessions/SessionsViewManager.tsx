"use client"
/**
 * SessionsViewManager — gère l'alternance entre liste et calendrier.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { SessionsCalendar } from "./SessionsCalendar"
import { SessionCard } from "./SessionCard"
import { useAuth } from "@/hooks/useAuth"
import { SessionDetail } from "@/types"
import { LayoutGrid, List } from "lucide-react"

interface Props { locale: string }

export function SessionsViewManager({ locale }: Props) {
  const { profile } = useAuth()
  const [view, setView] = useState<"list" | "calendar">("list")
  const [sessions, setSessions] = useState<SessionDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await api.get<SessionDetail[]>("/sessions/")
        setSessions(data)
      } catch (err) {
        const msg = err instanceof ApiError ? err.detail : err instanceof Error ? err.message : String(err)
        setError("Erreur chargement : " + msg)
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
      const data = await api.get<SessionDetail[]>("/sessions/")
      setSessions(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur inattendue")
    } finally {
      setActionLoadingId(null)
    }
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-bg-muted" />
  if (error) return <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>

  const role = (profile?.role as "student" | "tutor" | "parent" | "admin") || "student"

  return (
    <div className="flex flex-col gap-6">
      {/* ── Contrôles de vue ────────────────────────────────────── */}
      <div className="flex p-1 bg-bg-base border border-border rounded-xl self-start">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "list" ? "bg-primary-50 text-primary-600 shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <List size={18} />
          Liste
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "calendar" ? "bg-primary-50 text-primary-600 shadow-sm" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <LayoutGrid size={18} />
          Calendrier
        </button>
      </div>

      {/* ── Rendu de la vue ─────────────────────────────────────── */}
      {view === "list" ? (
        <div className="flex flex-col gap-3">
          {sessions.map(s => (
            <SessionCard 
              key={s.id} 
              session={s} 
              locale={locale} 
              viewAs={role} 
              onConfirm={handleConfirm}
              isActionLoading={actionLoadingId === s.id}
            />
          ))}
          {sessions.length === 0 && <p className="text-center py-10 text-text-muted">Aucune session.</p>}
        </div>
      ) : (
        <SessionsCalendar sessions={sessions} locale={locale} />
      )}
    </div>
  )
}
