"use client"
/**
 * TutorPublicProfile — profil complet d'un tuteur avec bouton réservation.
 */

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/Badge"
import { BookingWizard } from "@/components/sessions/BookingWizard"
import { Button } from "@/components/ui/Button"
import type { TutorCard } from "@/types"

interface TutorPublicProfileProps {
  tutorId: string
  locale:  string
}

export function TutorPublicProfile({ tutorId, locale }: TutorPublicProfileProps) {
  const [tutor,     setTutor]     = useState<TutorCard | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/backend/tutors/${tutorId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setTutor)
      .catch(() => setError("Tuteur introuvable."))
      .finally(() => setIsLoading(false))
  }, [tutorId])

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
  if (error || !tutor) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* ── En-tête ────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 rounded-xl bg-[var(--bg-base)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-2xl font-bold text-[var(--color-primary-700)]">
          {tutor.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{tutor.full_name}</h1>
            {tutor.canope_certified && <Badge variant="success" size="sm">CANOPE</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            ⭐ {tutor.avg_rating.toFixed(1)} · {tutor.total_sessions} sessions
          </p>
          {tutor.location && (
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">📍 {tutor.location}</p>
          )}
          <p className="mt-2 text-lg font-bold text-[var(--color-primary-600)]">
            {tutor.hourly_rate.toLocaleString("fr-MG")} Ar / heure
          </p>
        </div>
      </div>

      {/* ── Bio ─────────────────────────────────────────────────── */}
      {tutor.bio && (
        <div className="rounded-xl bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="mb-2 font-semibold text-[var(--text-primary)]">À propos</h2>
          <p className="text-sm text-[var(--text-secondary)]">{tutor.bio}</p>
        </div>
      )}

      {/* ── Matières & niveaux ──────────────────────────────────── */}
      <div className="rounded-xl bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="mb-3 font-semibold text-[var(--text-primary)]">Matières enseignées</h2>
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.map((s) => <Badge key={s} variant="default">{s}</Badge>)}
        </div>
        {tutor.grade_levels.length > 0 && (
          <>
            <h2 className="mb-3 mt-4 font-semibold text-[var(--text-primary)]">Niveaux</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.grade_levels.map((l) => <Badge key={l} variant="default">{l}</Badge>)}
            </div>
          </>
        )}
      </div>

      {/* ── Réservation ─────────────────────────────────────────── */}
      {!showWizard ? (
        <Button onClick={() => setShowWizard(true)} className="w-full">
          Réserver une session
        </Button>
      ) : (
        <div className="rounded-xl bg-[var(--bg-base)] p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Réserver une session</h2>
            <button
              onClick={() => setShowWizard(false)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Annuler
            </button>
          </div>
          <BookingWizard tutor={tutor} locale={locale} />
        </div>
      )}
    </div>
  )
}
