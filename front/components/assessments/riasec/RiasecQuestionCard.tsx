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
      <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full transition-colors"
        style={{ background: answered ? profile.tone : "#e2e8f0" }} />

      <div className="flex items-start justify-between gap-6 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <span className="mt-0.5 inline-flex h-6 min-w-[28px] px-1.5 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500 tabular-nums">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <p className="text-[15px] font-medium leading-snug text-slate-900 max-w-[60ch]">
            {q.text}
          </p>
        </div>
        <span className="hidden md:inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: profile.tone }} />
          {profile.name}
        </span>
      </div>

      <div className="pl-0 sm:pl-11">
        <DiscLikert style={likertStyle} value={value} onChange={onChange} accent={profile.tone} />
      </div>
    </article>
  )
}
