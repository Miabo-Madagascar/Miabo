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
  [AssessmentStatus.Draft]:      { label: "Brouillon",    classes: "bg-gray-100 text-gray-600 border border-gray-200" },
  [AssessmentStatus.InProgress]: { label: "En cours",     classes: "bg-primary-50 text-primary-700 border border-primary-200" },
  [AssessmentStatus.Validated]:  { label: "Validé",       classes: "bg-success/10 text-success border border-success/20" },
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-bg-muted" />)}
    </div>
  )

  if (error) return (
    <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-error">{error}</p>
  )

  if (assessments.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-bg-subtle p-12 text-center mt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary shadow-inner">
         <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
         </svg>
      </div>
      <div>
        <p className="text-xl font-bold text-text-primary">Aucun bilan créé</p>
        <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          Vous n&apos;avez pas encore créé de bilan d&apos;orientation. Commencez par en ajouter un pour un élève ou un jeune externe.
        </p>
      </div>
      <Link 
        href={`/${locale}/${basePath}/bilans/nouveau`} 
        className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary-600"
      >
        Créer mon premier bilan
      </Link>
    </div>
  )

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {assessments.map((a) => {
        const cfg    = STATUS_LABEL[a.status as AssessmentStatus] ?? STATUS_LABEL[AssessmentStatus.Draft]
        const date   = new Date(a.created_at).toLocaleDateString("fr-MG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" })
        // Nom du jeune — préfère le nom résolu, sinon fallback
        const subject = a.external_young_full_name ?? (a.student_profile_id ? "Élève MIABO" : "Jeune externe")

        let completed = 0;
        if (a.vak_dominant) completed++;
        if (a.riasec_code) completed++;
        if (a.disc_dominant) completed++;
        
        return (
          <div key={a.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-bg-base p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl">
            {a.status === AssessmentStatus.Validated && (
               <div className="absolute top-0 left-0 h-1 w-full bg-success opacity-70" />
            )}
            {a.status === AssessmentStatus.InProgress && (
               <div className="absolute top-0 left-0 h-1 w-full bg-primary opacity-50" />
            )}
            
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-bold text-text-primary text-xl tracking-tight">{subject}</p>
                <p className="text-xs text-text-muted mt-1">{date}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.classes}`}>
                {cfg.label}
              </span>
            </div>
            
            <div className="flex-1 mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2.5">
                <span>Progression</span>
                <span>{completed}/3 tests</span>
              </div>
              <div className="h-2.5 w-full bg-bg-muted rounded-full overflow-hidden mb-5">
                <div 
                  className={`h-full transition-all duration-1000 ${completed === 3 ? "bg-success" : "bg-primary"}`} 
                  style={{ width: `${(completed/3)*100}%` }} 
                />
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-text-secondary">
                {a.vak_dominant ? <span className="bg-bg-subtle px-2 py-1.5 rounded-lg border">VAK : <span className="text-primary">{a.vak_dominant}</span></span> : null}
                {a.riasec_code ? <span className="bg-bg-subtle px-2 py-1.5 rounded-lg border">RIASEC : <span className="text-primary">{a.riasec_code}</span></span> : null}
                {a.disc_dominant ? <span className="bg-bg-subtle px-2 py-1.5 rounded-lg border">DISC : <span className="text-primary">{a.disc_dominant}</span></span> : null}
                {completed === 0 && <span className="italic opacity-50 font-normal">Aucun résultat</span>}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-medium text-text-muted truncate mr-4">
                 ID: {a.id.slice(0,8)}...
              </span>
              <Link
                href={`/${locale}/${basePath}/bilans/${a.id}`}
                className="shrink-0 rounded-xl bg-bg-subtle px-5 py-2.5 text-xs font-bold text-text-primary transition-all group-hover:bg-primary group-hover:text-white"
              >
                Modifier
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
