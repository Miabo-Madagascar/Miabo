"use client"
/**
 * TutorSearchClient — recherche de tuteurs avec filtres en temps réel.
 * Route publique — pas de token requis.
 */

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { TutorCard } from "./TutorCard"
import { Input } from "@/components/ui/Input"
import type { TutorCard as TutorCardType } from "@/types"

interface TutorSearchClientProps {
  locale: string
}

export function TutorSearchClient({ locale }: TutorSearchClientProps) {
  const [tutors,    setTutors]    = useState<TutorCardType[]>([])
  const [subject,   setSubject]   = useState("")
  const [location,  setLocation]  = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const fetchTutors = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (subject)  params.set("subject",  subject)
      if (location) params.set("location", location)
      const query = params.toString() ? `?${params}` : ""
      const data  = await api.getPublic<TutorCardType[]>(`/tutors/search${query}`)
      setTutors(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Impossible de charger les tuteurs.")
    } finally {
      setIsLoading(false)
    }
  }, [subject, location])

  // Debounce 400ms sur les filtres
  useEffect(() => {
    const timer = setTimeout(fetchTutors, 400)
    return () => clearTimeout(timer)
  }, [fetchTutors])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Trouver un tuteur</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Tuteurs certifiés CANOPE, disponibles à Madagascar.
        </p>
      </div>

      {/* ── Filtres ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-base)] p-4 shadow-[var(--shadow-sm)] sm:flex-row">
        <Input
          label="Matière"
          placeholder="Maths, Français, Physique…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Input
          label="Localisation"
          placeholder="Antananarivo, Tamatave…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* ── Résultats ─────────────────────────────────────────────── */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">{error}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-default)] p-10 text-center text-[var(--text-secondary)]">
          Aucun tuteur trouvé pour ces critères.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <TutorCard key={t.id} tutor={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
