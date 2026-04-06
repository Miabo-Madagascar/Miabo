"use client"
/**
 * AssessmentListClient — liste des bilans d'orientation de l'acteur connecté.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { api, ApiError } from "@/lib/api/client"
import { AssessmentStatus } from "@/types"
import type { Assessment } from "@/types"

interface AssessmentListClientProps {
  locale:   string
  basePath: string  // "canope" | "cosp"
}

const STATUS_LABEL: Record<AssessmentStatus, { label: string; classes: string }> = {
  [AssessmentStatus.Draft]:      { label: "Brouillon",    classes: "bg-gray-100 text-gray-600" },
  [AssessmentStatus.InProgress]: { label: "En cours",     classes: "bg-yellow-100 text-yellow-700" },
  [AssessmentStatus.Validated]:  { label: "Validé",       classes: "bg-green-100 text-green-700" },
}

export function AssessmentListClient({ locale, basePath }: AssessmentListClientProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    api.get<Assessment[]>("/assessments/")
      .then(setAssessments)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erreur de chargement"))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--bg-muted)]" />)}
    </div>
  )

  if (error) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">{error}</p>
  )

  if (assessments.length === 0) return (
    <div className="rounded-xl border border-dashed border-[var(--border-default)] p-10 text-center text-sm text-[var(--text-secondary)]">
      Aucun bilan créé. Commencez par en créer un.
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {assessments.map((a) => {
        const cfg    = STATUS_LABEL[a.status as AssessmentStatus] ?? STATUS_LABEL[AssessmentStatus.Draft]
        const date   = new Date(a.created_at).toLocaleDateString("fr-MG", { day: "numeric", month: "short", year: "numeric" })
        const subject = a.student_profile_id ? "Élève MIABO" : "Jeune externe"
        return (
          <div key={a.id} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--bg-base)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-[var(--text-primary)]">{subject}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {date}
                {a.vak_dominant  && ` · VAK : ${a.vak_dominant}`}
                {a.riasec_code   && ` · RIASEC : ${a.riasec_code}`}
                {a.disc_dominant && ` · DISC : ${a.disc_dominant}`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
                {cfg.label}
              </span>
              <Link
                href={`/${locale}/${basePath}/bilans/${a.id}`}
                className="rounded-lg border border-[var(--border-default)] px-3 py-1 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                Voir
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
