import { VAK_PROFILES }           from "../data/vakProfiles"
import { VakProfileIllustration }  from "./VakProfileIllustration"
import { VakInterpretationCard }   from "./VakInterpretationCard"

interface Props {
  scores:   Record<string, number>
  onRetake: () => void
  onBack:   () => void
}

export function VakResults({ scores, onRetake, onBack }: Props) {
  const ranked = Object.values(VAK_PROFILES)
    .map(p => ({ ...p, score: scores[p.letter] ?? 0 }))
    .sort((a, b) => b.score - a.score)
  const top   = ranked[0]
  const total = ranked.reduce((s, p) => s + p.score, 0) || 1

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* En-tête */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: top.tone }} />
            Profil VAK · Terminé
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-slate-900">
            Votre profil dominant&nbsp;:
          </h1>
          <div className="mt-6 inline-flex items-center gap-5 rounded-3xl bg-white border border-slate-200 px-7 py-5 shadow-sm">
            <VakProfileIllustration type={top.letter} size={88} />
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white text-[13px]"
                  style={{ background: top.tone }}>
                  {top.letter}
                </span>
                <span className="font-display text-2xl font-bold text-slate-900">{top.name}</span>
              </div>
              <div className="text-sm text-slate-500">{top.trait}</div>
            </div>
          </div>
          <p className="mt-6 text-[15px] text-slate-600 max-w-prose mx-auto">{top.sub}</p>

          {/* Scores bruts */}
          <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-5 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Scores</span>
            <div className="flex items-center gap-3">
              {ranked.map(p => (
                <span key={p.letter} className="flex items-center gap-1.5 text-[14px] font-bold tabular-nums"
                  style={{ color: p.tone }}>
                  {p.letter}<span className="text-slate-400 font-normal">=</span>{p.score}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Répartition détaillée */}
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
                        style={{ background: p.tone }}>{p.letter}</span>
                      <span className="text-[14px] font-semibold text-slate-900">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold tabular-nums text-slate-500">
                      <span>{p.score} pts</span>
                      <span className="text-slate-300">·</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: p.tone }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Interprétation du profil dominant */}
        <VakInterpretationCard dominantLetter={top.letter} />

        <div className="mt-10 flex items-center justify-center gap-3">
          <button onClick={onRetake}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
            Refaire le test
          </button>
          <button onClick={onBack}
            className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition bg-primary">
            Retour au bilan
          </button>
        </div>
      </div>
    </div>
  )
}
