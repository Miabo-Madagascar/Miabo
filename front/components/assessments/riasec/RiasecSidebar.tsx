import { RIASEC_PROFILES, RIASEC_ORDER } from "../data/riasecProfiles"
import type { RiasecType } from "../data/riasecProfiles"

interface Props {
  scores:      Record<RiasecType, number>
  currentType: string | null
}

export function RiasecSidebar({ scores, currentType }: Props) {
  const total = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0) || 1

  return (
    <aside className="sticky top-28 self-start space-y-3 w-[280px] shrink-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500">
            Les 6 profils
          </h3>
          <span className="text-[10px] text-slate-400">Aperçu temps réel</span>
        </div>

        <div className="space-y-2.5">
          {RIASEC_ORDER.map(letter => {
            const p         = RIASEC_PROFILES[letter]
            const pct       = Math.round((scores[letter] / total) * 100)
            const isCurrent = currentType === letter

            return (
              <div key={letter}
                className={`rounded-xl p-2.5 transition-all ${isCurrent ? "bg-slate-50 ring-1 ring-slate-200" : ""}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                      style={{ background: p.tone }}>
                      {p.letter}
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold text-slate-900 leading-none">{p.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.trait}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-slate-500">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: p.tone }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
          <span className="text-slate-900 font-bold">Astuce.</span>{" "}
          Répondez vite et spontanément.
          Il n&apos;y a pas de bonne réponse, vos premières impressions sont les plus justes.
        </p>
      </div>
    </aside>
  )
}
