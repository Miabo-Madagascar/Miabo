"use client"
/**
 * SessionDetailClient — détail d'une session avec actions contextuelles.
 * Le tuteur peut confirmer/refuser. Le parent peut approuver.
 * Tout le monde peut annuler (selon statut).
 */

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SessionStatusBadge } from "./SessionStatusBadge"
import { Button } from "@/components/ui/Button"
import { SessionStatus } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/types"

interface SessionDetailClientProps {
  sessionId: string
  locale:    string
}

export function SessionDetailClient({ sessionId, locale }: SessionDetailClientProps) {
  const router   = useRouter()
  const supabase = createClient()
  const { profile } = useAuth()

  const [session,   setSession]   = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      const token = auth?.access_token
      const res = await fetch(`/api/backend/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Session introuvable")
      setSession(await res.json())
    } catch {
      setError("Impossible de charger cette session.")
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, supabase])

  useEffect(() => { load() }, [load])

  async function callAction(endpoint: string, method = "PUT", body?: object) {
    setActionLoading(true)
    setError(null)
    try {
      const { data: { session: auth } } = await supabase.auth.getSession()
      const token = auth?.access_token
      const res = await fetch(`/api/backend/sessions/${sessionId}/${endpoint}`, {
        method,
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail ?? "Erreur")
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
  if (error && !session) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">{error}</p>
  )
  if (!session) return null

  const date    = new Date(session.scheduled_at)
  const dateStr = date.toLocaleDateString("fr-MG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const timeStr = date.toLocaleTimeString("fr-MG", { hour: "2-digit", minute: "2-digit" })
  const role    = profile?.role as UserRole | undefined

  const isTutor   = role === UserRole.Tutor  && profile?.id === session.tutor?.id
  const isParent  = role === UserRole.Parent
  const canCancel = [SessionStatus.PendingParent, SessionStatus.PendingTutor, SessionStatus.Confirmed]
    .includes(session.status as SessionStatus)

  return (
    <div className="flex flex-col gap-6">
      {/* ── En-tête ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {session.subject}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {dateStr} à {timeStr}
          </p>
        </div>
        <SessionStatusBadge status={session.status as SessionStatus} />
      </div>

      {/* ── Infos ──────────────────────────────────────────────── */}
      <div className="grid gap-4 rounded-xl bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)] sm:grid-cols-2">
        <Detail label="Élève"     value={session.student?.full_name ?? "—"} />
        <Detail label="Tuteur"    value={session.tutor?.full_name   ?? "—"} />
        <Detail label="Durée"     value={`${session.duration_minutes / 60}h`} />
        <Detail label="Format"    value={session.mode === "online" ? "En ligne" : "Présentiel"} />
        <Detail label="Montant"   value={`${session.amount_ariary?.toLocaleString("fr-MG")} Ar`} />
        {session.student_objectives && (
          <Detail label="Objectifs" value={session.student_objectives} />
        )}
      </div>

      {/* ── Erreur action ──────────────────────────────────────── */}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">{error}</p>
      )}

      {/* ── Actions tuteur ─────────────────────────────────────── */}
      {isTutor && session.status === SessionStatus.PendingTutor && (
        <div className="flex gap-3">
          <Button
            className="flex-1"
            isLoading={actionLoading}
            onClick={() => callAction("confirm", "PUT", { accepted: true })}
          >
            Accepter
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={actionLoading}
            onClick={() => callAction("confirm", "PUT", { accepted: false })}
          >
            Refuser
          </Button>
        </div>
      )}

      {/* ── Actions parent ─────────────────────────────────────── */}
      {isParent && session.status === SessionStatus.PendingParent && (
        <div className="flex gap-3">
          <Button
            className="flex-1"
            isLoading={actionLoading}
            onClick={() => callAction("approve?approved=true")}
          >
            Approuver
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={actionLoading}
            onClick={() => callAction("approve?approved=false")}
          >
            Refuser
          </Button>
        </div>
      )}

      {/* ── Annulation ─────────────────────────────────────────── */}
      {canCancel && (
        <Button
          variant="outline"
          isLoading={actionLoading}
          onClick={() => callAction("cancel")}
        >
          Annuler la session
        </Button>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-0.5 text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
