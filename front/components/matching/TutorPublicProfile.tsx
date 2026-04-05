"use client"
/**
 * TutorPublicProfile — profil complet d'un tuteur avec bouton de réservation.
 * Route publique — pas de token requis pour consulter le profil.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { BookingWizard } from "@/components/sessions/BookingWizard"

interface TutorPublicProfileProps {
  tutorId: string
  locale:  string
}

interface TutorDetail {
  id:               string
  full_name:        string
  avatar_url:       string | null
  bio:              string | null
  subjects:         string[]
  grade_levels:     string[]
  teaching_methods: string[]
  location:         string | null
  hourly_rate:      number
  avg_rating:       number
  total_sessions:   number
  canope_certified: boolean
}

export function TutorPublicProfile({ tutorId, locale }: TutorPublicProfileProps) {
  const [tutor,       setTutor]       = useState<TutorDetail | null>(null)
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPublic<TutorDetail>(`/tutors/${tutorId}`)
        setTutor(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.detail : "Tuteur introuvable.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [tutorId])

  if (isLoading) return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
      ))}
    </div>
  )

  if (error || !tutor) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">
      {error ?? "Tuteur introuvable."}
    </p>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* ── En-tête ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-2xl font-bold text-[var(--color-primary-700)]">
          {tutor.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {tutor.full_name}
            </h1>
            {tutor.canope_certified && <Badge variant="success">CANOPE</Badge>}
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            ⭐ {tutor.avg_rating.toFixed(1)} · {tutor.total_sessions} sessions
            {tutor.location && ` · ${tutor.location}`}
          </p>
          <p className="mt-1 font-semibold text-[var(--color-primary-600)]">
            {tutor.hourly_rate.toLocaleString("fr-MG")} Ar / heure
          </p>
        </div>
      </div>

      {tutor.bio && (
        <p className="text-[var(--text-secondary)]">{tutor.bio}</p>
      )}

      {tutor.subjects.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text-tertiary)]">Matières</p>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map(s => <Badge key={s}>{s}</Badge>)}
          </div>
        </div>
      )}

      {tutor.grade_levels.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text-tertiary)]">Niveaux</p>
          <div className="flex flex-wrap gap-2">
            {tutor.grade_levels.map(g => <Badge key={g} variant="primary">{g}</Badge>)}
          </div>
        </div>
      )}

      {/* ── Réservation ─────────────────────────────────────────── */}
      {!showBooking ? (
        <Button onClick={() => setShowBooking(true)} className="mt-2">
          Réserver une session
        </Button>
      ) : (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Réserver une session</h2>
            <button
              onClick={() => setShowBooking(false)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Annuler
            </button>
          </div>
          <BookingWizard
            tutorId={tutor.id}
            tutorName={tutor.full_name}
            hourlyRate={tutor.hourly_rate}
            locale={locale}
            onSuccess={() => setShowBooking(false)}
          />
        </div>
      )}
    </div>
  )
}
