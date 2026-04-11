/**
 * SessionCard — carte d'une session dans la liste.
 */

import Link from "next/link"
import { SessionStatusBadge } from "./SessionStatusBadge"
import { SessionStatus } from "@/types"

import { Button } from "@/components/ui/Button"

interface SessionMini {
  id:               string
  status:           SessionStatus
  subject:          string
  scheduled_at:     string
  duration_minutes: number
  amount_ariary:    number
  mode:             string
  student:          { id: string; full_name: string } | null
  tutor:            { id: string; full_name: string } | null
}

interface SessionCardProps {
  session: SessionMini
  locale:  string
  viewAs:  "student" | "tutor" | "parent" | "admin"
  onConfirm?: (session: SessionMini, accepted: boolean) => void
  isActionLoading?: boolean
}

export function SessionCard({ session, locale, viewAs, onConfirm, isActionLoading }: SessionCardProps) {
  const date = new Date(session.scheduled_at)
  const dateStr = date.toLocaleDateString("fr-MG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  })
  const timeStr = date.toLocaleTimeString("fr-MG", { hour: "2-digit", minute: "2-digit" })
  const durationH = session.duration_minutes / 60

  const counterpart = viewAs === "tutor" ? session.student : session.tutor
  const counterLabel = viewAs === "tutor" ? "Élève" : "Tuteur"

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-bg-base p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-text-primary">{session.subject}</p>
          <p className="text-sm text-text-secondary">
            {counterLabel} : {counterpart?.full_name ?? "—"}
          </p>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
        <span>📅 {dateStr} à {timeStr}</span>
        <span>⏱ {durationH}h</span>
        <span>{session.mode === "online" ? "🌐 En ligne" : "📍 Présentiel"}</span>
        <span className="font-medium text-text-primary">
          {session.amount_ariary.toLocaleString("fr-MG")} Ar
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 mt-2">
        {viewAs === "tutor" && session.status === SessionStatus.PendingTutor && onConfirm && (
          <>
            <Button size="sm" variant="danger" isLoading={isActionLoading} onClick={() => onConfirm(session, false)}>
              Refuser
            </Button>
            <Button size="sm" isLoading={isActionLoading} onClick={() => onConfirm(session, true)}>
              Accepter
            </Button>
          </>
        )}
        <Link
          href={`/${locale}/sessions/${session.id}`}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-subtle transition-colors"
        >
          Détails
        </Link>
      </div>
    </div>
  )
}
