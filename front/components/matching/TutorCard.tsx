/**
 * TutorCard — carte de présentation publique d'un tuteur.
 * Utilisée dans la recherche, le matching et les recommandations.
 */

import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import type { TutorCard as TutorCardType } from "@/types"

interface TutorCardProps {
  tutor:  TutorCardType
  locale: string
}

export function TutorCard({ tutor, locale }: TutorCardProps) {
  const profileHref = `/${locale}/tuteurs/${tutor.id}`

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-lg font-bold text-[var(--color-primary-700)]">
          {tutor.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-[var(--text-primary)]">
            {tutor.full_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>⭐ {tutor.avg_rating.toFixed(1)}</span>
            <span>·</span>
            <span>{tutor.total_sessions} sessions</span>
            {tutor.canope_certified && (
              <>
                <span>·</span>
                <Badge variant="success" size="sm">CANOPE</Badge>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-semibold text-[var(--color-primary-600)]">
            {tutor.hourly_rate.toLocaleString("fr-MG")} Ar
          </span>
          <span className="block text-xs text-[var(--text-tertiary)]">/heure</span>
        </div>
      </div>

      {/* ── Matières ────────────────────────────────────────────────── */}
      {tutor.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 4).map((s) => (
            <Badge key={s} variant="default" size="sm">{s}</Badge>
          ))}
          {tutor.subjects.length > 4 && (
            <Badge variant="default" size="sm">+{tutor.subjects.length - 4}</Badge>
          )}
        </div>
      )}

      {/* ── Bio ─────────────────────────────────────────────────────── */}
      {tutor.bio && (
        <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
          {tutor.bio}
        </p>
      )}

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        {tutor.location && (
          <span className="text-xs text-[var(--text-tertiary)]">
            📍 {tutor.location}
          </span>
        )}
        <Link
          href={profileHref}
          className="ml-auto rounded-lg bg-[var(--color-primary-500)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-600)] transition-colors"
        >
          Voir le profil
        </Link>
      </div>
    </div>
  )
}
