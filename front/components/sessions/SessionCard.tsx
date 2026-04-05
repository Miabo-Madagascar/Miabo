/**
 * SessionCard — carte d'une session dans la liste.
 */

import Link from "next/link"
import { SessionStatusBadge } from "./SessionStatusBadge"
import { SessionStatus } from "@/types"

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
}

export function SessionCard({ session, locale, viewAs }: SessionCardProps) {
  const date = new Date(session.scheduled_at)
  const dateStr = date.toLocaleDateString("fr-MG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  })
  const timeStr = date.toLocaleTimeString("fr-MG", { hour: "2-digit", minute: "2-digit" })
  const durationH = session.duration_minutes / 60

  const counterpart = viewAs === "tutor" ? session.student : session.tutor
  const counterLabel = viewAs === "tutor" ? "Élève" : "Tuteur"

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-base)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{session.subject}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {counterLabel} : {counterpart?.full_name ?? "—"}
          </p>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
        <span>📅 {dateStr} à {timeStr}</span>
        <span>⏱ {durationH}h</span>
        <span>{session.mode === "online" ? "🌐 En ligne" : "📍 Présentiel"}</span>
        <span className="font-medium text-[var(--text-primary)]">
          {session.amount_ariary.toLocaleString("fr-MG")} Ar
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={`/${locale}/sessions/${session.id}`}
          className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
        >
          Détails
        </Link>
      </div>
    </div>
  )
}
