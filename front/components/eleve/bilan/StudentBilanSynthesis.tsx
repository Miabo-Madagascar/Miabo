"use client"
/**
 * Synthèse de l'auto-bilan élève — soumission pour validation CANOPE/COSP,
 * puis affichage du statut (en attente / validé avec commentaire du conseiller).
 */

import { AssessmentStatus } from "@/types"

interface Props {
  status:       AssessmentStatus
  canSubmit:    boolean
  submitting:   boolean
  actorComment: string | null
  validatedAt:  string | null
  onSubmit:     () => void
}

export function StudentBilanSynthesis({ status, canSubmit, submitting, actorComment, validatedAt, onSubmit }: Props) {
  if (status === AssessmentStatus.Validated) {
    const date = validatedAt
      ? new Date(validatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : ""
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div>
            <h3 className="font-display text-[18px] font-bold text-slate-900">Bilan validé</h3>
            {date && <p className="text-[12px] text-slate-500">Synthèse du conseiller — {date}</p>}
          </div>
        </div>
        {actorComment && (
          <p className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap">{actorComment}</p>
        )}
      </section>
    )
  }

  if (status === AssessmentStatus.PendingValidation) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </span>
          <h3 className="font-display text-[18px] font-bold text-slate-900">En attente de validation</h3>
        </div>
        <p className="text-[14px] leading-relaxed text-slate-700">
          Ton bilan a bien été transmis. Un conseiller CANOPE/COSP va le relire et te laissera
          bientôt une synthèse personnalisée.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div>
          <h3 className="font-display text-[18px] font-bold text-slate-900">Mon bilan</h3>
          <p className="text-[12px] text-slate-500">
            Une fois les 3 tests terminés, soumets ton bilan pour validation.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-[12px] text-slate-500">
          {canSubmit
            ? "Les 3 tests sont complétés — tu peux soumettre ton bilan."
            : "Termine les 3 tests pour pouvoir soumettre ton bilan."}
        </p>
        <button onClick={onSubmit} disabled={!canSubmit || submitting}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0"
          style={canSubmit
            ? { background: "#3a6cf8", boxShadow: "0 8px 22px rgba(58,108,248,.35)" }
            : { background: "#94a3b8" }}>
          {submitting ? "Envoi…" : "Soumettre mon bilan"}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </section>
  )
}
