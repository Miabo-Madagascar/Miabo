import { BilanHeroIllustration } from "./BilanHeroIllustration"
import type { TestMeta } from "./bilanMeta"

interface Props {
  test:     TestMeta
  dominant: string | null
  locked:   boolean
  onStart:  () => void
}

export function BilanTestCard({ test, dominant, locked, onStart }: Props) {
  const completed       = dominant != null
  const dominantProfile = completed ? test.profiles.find(p => p.letter === dominant[0]) : null

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-300 ${
      completed
        ? "border-emerald-200/70"
        : "border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-0.5"
    }`}>

      {/* Hero illustration 160px */}
      <div className="relative h-[160px] w-full overflow-hidden">
        <BilanHeroIllustration testId={test.id}/>
        {completed && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Terminé
          </span>
        )}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"/>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
          <span>{test.module}</span>
          <span className="text-slate-300">·</span>
          <span>{test.duration}</span>
          <span className="text-slate-300">·</span>
          <span>{test.questions} questions</span>
        </div>

        <div>
          <h3 className="font-display text-[20px] font-bold tracking-tight text-slate-900 leading-tight">{test.title}</h3>
          <p className="mt-1 text-[13px] font-medium text-slate-500">{test.subtitle}</p>
        </div>

        <p className="text-[13px] leading-relaxed text-slate-600 line-clamp-3">{test.abstract}</p>

        {/* Profile chips quand non terminé */}
        {!completed && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {test.profiles.map(p => (
              <span key={p.letter}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border"
                style={{ color: p.tone, borderColor: `${p.tone}40`, background: `${p.tone}0c` }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.tone }}/>
                {p.letter}
              </span>
            ))}
          </div>
        )}

        {/* Résultat si terminé */}
        {completed && dominantProfile && (
          <div className="mt-1 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">Profil dominant</div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="flex h-7 min-w-[28px] px-1 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                  style={{ background: dominantProfile.tone }}>
                  {dominant}
                </span>
                <span className="font-display text-[18px] font-bold tracking-tight text-slate-900">
                  {dominantProfile.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-2 flex items-center gap-2">
          {completed ? (
            <>
              <button onClick={onStart}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition">
                Voir le détail
              </button>
              {!locked && (
                <button onClick={onStart} title="Refaire le test"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </>
          ) : (
            <button onClick={onStart}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-md transition hover:brightness-105"
              style={{ background: "#3a6cf8", boxShadow: "0 8px 18px rgba(58,108,248,0.35)" }}>
              Démarrer le test
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
