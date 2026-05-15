import { VAK_PROFILES, VAK_ORDER } from "../data/vakProfiles"
import { VAK_DESCRIPTION } from "../data/vakQuestions"
import { VakProfileIllustration } from "./VakProfileIllustration"

interface Props {
  totalCount:  number
  durationMin?: number
}

export function VakHero({ totalCount, durationMin = 4 }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {/* Dégradé décoratif — violet/cyan propre à la charte VAK */}
      <div aria-hidden className="absolute inset-0 opacity-[0.55] pointer-events-none"
        style={{
          background: [
            "radial-gradient(80% 60% at 90% 0%, #7c3aed14, transparent 60%)",
            "radial-gradient(60% 60% at 0% 100%, var(--color-secondary-50), transparent 60%)",
          ].join(", "),
        }} />

      <div className="relative p-8 sm:p-10">
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7c3aed" }} />
            Module 1 / 3 — Apprentissage
          </span>
        </div>

        <h1 className="font-display text-[34px] sm:text-[40px] leading-[1.05] font-bold tracking-tight text-slate-900 max-w-[18ch]">
          Comment apprenez-vous le mieux&nbsp;?
        </h1>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-slate-600">
          {VAK_DESCRIPTION}
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-6 sm:gap-10 max-w-xs">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Durée</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-slate-900">~{durationMin} min</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Questions</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-slate-900">{totalCount}</dd>
          </div>
        </dl>

        {/* Aperçu des 3 profils */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VAK_ORDER.map(letter => {
            const p = VAK_PROFILES[letter]
            return (
              <div key={letter}
                className="flex items-center gap-3 rounded-xl bg-white/70 border border-slate-200/80 p-2.5">
                <VakProfileIllustration type={letter} size={48} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: p.tone }}>
                    {p.letter} · {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight truncate">{p.trait}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
