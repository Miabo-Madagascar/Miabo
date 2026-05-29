/**
 * Barres de score RIASEC — répartition complète avec pts et %.
 */

interface ProfileBar { letter: string; name: string; tone: string; score: number }

interface Props {
  ranked: ProfileBar[]
  total:  number
}

export function RiasecScoreBars({ ranked, total }: Props) {
  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6">
      <h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500 mb-5">
        Répartition complète
      </h3>
      <div className="space-y-4">
        {ranked.map(p => {
          const pct = Math.round((p.score / total) * 100)
          return (
            <div key={p.letter}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
                    style={{ background: p.tone }}>
                    {p.letter}
                  </span>
                  <span className="text-[14px] font-semibold text-slate-900">{p.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold tabular-nums text-slate-500">
                  <span>{p.score} pts</span>
                  <span className="text-slate-300">·</span>
                  <span>{pct}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: p.tone }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
