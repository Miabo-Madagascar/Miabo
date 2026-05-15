import { RiasecProfileIllustration } from "./RiasecProfileIllustration"
import { RIASEC_PROFILES } from "../data/riasecProfiles"

interface Props {
  type:       string
  indexLabel: string
  answered:   number
  total:      number
}

export function RiasecSectionHeader({ type, indexLabel, answered, total }: Props) {
  const p   = RIASEC_PROFILES[type]
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0

  return (
    <header className="mt-12 first:mt-2 mb-5 flex items-center gap-5 sm:gap-6">
      <div className="shrink-0">
        <RiasecProfileIllustration type={type} size={104} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
            {indexLabel}
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em]"
            style={{ color: p.tone }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.tone }} />
            {p.letter} — {p.name}
          </span>
        </div>

        <h2 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
          {p.trait}
        </h2>
        <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed max-w-prose">{p.sub}</p>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, background: p.tone }} />
          </div>
          <span className="text-[10px] font-bold tabular-nums text-slate-500">
            {answered}/{total}
          </span>
        </div>
      </div>
    </header>
  )
}
