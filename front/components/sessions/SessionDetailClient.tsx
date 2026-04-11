"use client"
/**
 * SessionDetailClient — détail d'une session avec actions contextuelles.
 * Le tuteur peut confirmer/refuser. Le parent peut approuver.
 * L'élève peut payer une session confirmée. Tout le monde peut annuler.
 */

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { SessionStatusBadge } from "./SessionStatusBadge"
import { Button } from "@/components/ui/Button"
import { PaymentForm } from "@/components/payment/PaymentForm"
import { SessionStatus, SessionDetail } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/types"

interface SessionDetailClientProps {
  sessionId: string
  locale:    string
}

export function SessionDetailClient({ sessionId, locale: _locale }: SessionDetailClientProps) {
  const { profile } = useAuth()

  const [session,       setSession]       = useState<SessionDetail | null>(null)
  const [isLoading,     setIsLoading]     = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [showPayment,   setShowPayment]   = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<SessionDetail>(`/sessions/${sessionId}`)
      setSession(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Impossible de charger cette session.")
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => { load() }, [load])

  async function callAction(endpoint: string, method: "PUT" | "POST" = "PUT", body?: object) {
    setActionLoading(true)
    setError(null)
    try {
      if (method === "PUT") {
        await api.put(`/sessions/${sessionId}/${endpoint}`, body)
      } else {
        await api.post(`/sessions/${sessionId}/${endpoint}`, body)
      }
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur inattendue")
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

  const isTutor   = role === UserRole.Tutor   && profile?.id === session.tutor?.id
  const isStudent = role === UserRole.Student  && profile?.id === session.student?.id
  const isParent  = role === UserRole.Parent
  const canCancel = [SessionStatus.PendingParent, SessionStatus.PendingTutor, SessionStatus.Confirmed]
    .includes(session.status as SessionStatus)
  const canPay    = isStudent && session.status === SessionStatus.Confirmed && !session.payment_id

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
      <div className="grid gap-4 rounded-xl bg-bg-base p-5 shadow-sm sm:grid-cols-2">
        <Detail label="Élève"   value={session.student?.full_name ?? "—"} />
        <Detail label="Tuteur"  value={session.tutor?.full_name   ?? "—"} />
        <Detail label="Durée"   value={`${session.duration_minutes / 60}h`} />
        <Detail label="Format"  value={session.mode === "online" ? "En ligne" : "Présentiel"} />
        <Detail label="Montant" value={`${session.amount_ariary?.toLocaleString("fr-MG")} Ar`} />
        {session.student_objectives && (
          <Detail label="Objectifs" value={session.student_objectives} />
        )}
      </div>

      {/* ── Erreur action ──────────────────────────────────────── */}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* ── Actions tuteur ─────────────────────────────────────── */}
      {isTutor && session.status === SessionStatus.PendingTutor && (
        <div className="flex gap-3">
          <Button className="flex-1" isLoading={actionLoading}
            onClick={() => callAction("confirm", "PUT", { accepted: true })}>
            Accepter
          </Button>
          <Button variant="danger" className="flex-1" isLoading={actionLoading}
            onClick={() => callAction("confirm", "PUT", { accepted: false })}>
            Refuser
          </Button>
        </div>
      )}

      {/* ── Actions parent ─────────────────────────────────────── */}
      {isParent && session.status === SessionStatus.PendingParent && (
        <div className="flex gap-3">
          <Button className="flex-1" isLoading={actionLoading}
            onClick={() => callAction("approve?approved=true")}>
            Approuver
          </Button>
          <Button variant="danger" className="flex-1" isLoading={actionLoading}
            onClick={() => callAction("approve?approved=false")}>
            Refuser
          </Button>
        </div>
      )}

      {/* ── Paiement élève ─────────────────────────────────────── */}
      {canPay && !showPayment && (
        <Button onClick={() => setShowPayment(true)}>Payer cette session</Button>
      )}
      {canPay && showPayment && (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5">
          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Paiement</h3>
          <PaymentForm
            sessionId={sessionId}
            amountAriary={session.amount_ariary}
            onSuccess={() => { setShowPayment(false); load() }}
          />
        </div>
      )}

      {/* ── Annulation ─────────────────────────────────────────── */}
      {canCancel && (
        <Button variant="outline" isLoading={actionLoading}
          onClick={() => callAction("cancel")}>
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
