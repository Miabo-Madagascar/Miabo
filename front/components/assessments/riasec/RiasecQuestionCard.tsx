"use client"

import { DiscLikert, LikertStyle } from "../disc/DiscLikert"
import { RIASEC_PROFILES } from "../data/riasecProfiles"
import type { RiasecQuestion } from "../data/riasecQuestions"

interface Props {
  q:           RiasecQuestion
  idx:         number
  value:       number | undefined
  onChange:    (v: number) => void
  likertStyle: LikertStyle
}

export function RiasecQuestionCard({ q, idx, value, onChange, likertStyle }: Props) {
  const profile  = RIASEC_PROFILES[q.type]
  const answered = value != null

  return (
    <article className={`relative rounded-2xl border bg-white px-6 py-5 transition-all duration-300 ${
      answered
        ? "border-slate-200 shadow-[0_1px_0_rgba(0,0,0,.02)]"
        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
    }`}>
      {/* Indicateur neutre — ne révèle pas le type de profil */}
      <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full transition-colors"
        style={{ background: answered ? "#6366f1" : "#e2e8f0" }} />

      <div className="flex items-start gap-4 mb-4">
        <span className="mt-0.5 inline-flex h-6 min-w-7 px-1.5 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500 tabular-nums">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <p className="text-[15px] font-medium leading-snug text-slate-900 max-w-[60ch]">
          {q.text}
        </p>
      </div>

      <div className="pl-0 sm:pl-11">
        <DiscLikert style={likertStyle} value={value} onChange={onChange} accent="#6366f1" />
      </div>
    </article>
  )
}
