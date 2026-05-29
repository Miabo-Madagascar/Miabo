"use client"

import { BilanAiSuggestion } from "./BilanAiSuggestion"

interface Props {
  locked:          boolean
  canValidate:     boolean
  validating:      boolean
  comment:         string
  actorComment:    string | null
  validatedAt:     string | null
  assessmentId:    string
  onCommentChange: (v: string) => void
  onValidate:      () => void
}

export function BilanSynthesis({
  locked, canValidate, validating, comment, assessmentId,
  actorComment, validatedAt, onCommentChange, onValidate,
}: Props) {
  if (locked) {
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
            <h3 className="font-display text-[18px] font-bold text-slate-900">Observations validées</h3>
            {date && <p className="text-[12px] text-slate-500">Synthèse validée le {date}</p>}
          </div>
        </div>
        <p className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap">{actorComment}</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div>
          <h3 className="font-display text-[18px] font-bold text-slate-900">Synthèse du conseiller</h3>
          <p className="text-[12px] text-slate-500">
            Vos observations apparaîtront sur le rapport remis à l&apos;élève.
          </p>
        </div>
      </div>

      {/* Aide IA — visible uniquement quand les 3 tests sont terminés */}
      {canValidate && (
        <div className="mt-4">
          <BilanAiSuggestion assessmentId={assessmentId} onUse={onCommentChange} />
        </div>
      )}

      <textarea
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all min-h-[140px] resize-none"
        placeholder="Rédigez votre synthèse ici… Profil dominant, points forts, axes d'orientation envisagés."
        value={comment}
        onChange={e => onCommentChange(e.target.value)}/>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-[12px] text-slate-500">
          {canValidate
            ? "Les 3 tests sont complétés — vous pouvez valider le bilan."
            : "Terminez les 3 tests pour pouvoir valider le bilan."}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onValidate} disabled={!canValidate || validating}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            style={canValidate
              ? { background: "#16a34a", boxShadow: "0 8px 22px rgba(22,163,74,.4)" }
              : { background: "#94a3b8" }}>
            {validating ? "Validation…" : "Clôturer & valider"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
