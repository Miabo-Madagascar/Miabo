"use client"

import { useState }                        from "react"
import { RIASEC_PROFILES }                 from "../data/riasecProfiles"
import { RiasecProfileIllustration }       from "./RiasecProfileIllustration"
import { RiasecCodeSelector }              from "./RiasecCodeSelector"
import { RiasecScoreBars }                 from "./RiasecScoreBars"
import { RiasecInterpretationsSection }    from "./RiasecInterpretationsSection"

interface Props {
  scores:          Record<string, number>
  onRetake:        () => void
  onBack:          () => void
  /** Code déjà sauvegardé — évite de ré-afficher le sélecteur si déjà résolu */
  savedCode?:      string | null
  /** Appelé quand l'user valide un code (ex-aequo résolu) pour le persister */
  onCodeUpdate?:   (code: string) => Promise<void>
}

export function RiasecResults({ scores, onRetake, onBack, savedCode, onCodeUpdate }: Props) {
  const ranked = Object.values(RIASEC_PROFILES)
    .map(p => ({ ...p, score: scores[p.letter] ?? 0 }))
    .sort((a, b) => b.score - a.score)

  const total = ranked.reduce((s, p) => s + p.score, 0) || 1
  const top   = ranked[0]

  /* Ex-aequo : vrai si des égalités existent dans le top 3 */
  const hasExAequo =
    ranked[0].score === ranked[1].score ||
    ranked[1].score === ranked[2].score ||
    (ranked[2] && ranked[3] && ranked[2].score === ranked[3].score)

  const defaultCode = ranked.slice(0, 3).map(p => p.letter).join("")
  /* savedCode prioritaire — si absent et ex-aequo → null (le sélecteur s'affiche) */
  const [code, setCode] = useState<string | null>(
    savedCode !== undefined ? (savedCode ?? (hasExAequo ? null : defaultCode))
                            : (hasExAequo ? null : defaultCode)
  )

  const handleCodeCommit = async (chosen: string) => {
    setCode(chosen)
    if (onCodeUpdate) await onCodeUpdate(chosen)
  }

  const top3 = ranked.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* En-tête */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: top.tone }} />
            Test RIASEC · Terminé
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-slate-900">
            Votre profil dominant&nbsp;:
          </h1>
          <div className="mt-6 inline-flex items-center gap-5 rounded-3xl bg-white border border-slate-200 px-7 py-5 shadow-sm">
            <RiasecProfileIllustration type={top.letter} size={88} />
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white text-[13px]"
                  style={{ background: top.tone }}>{top.letter}</span>
                <span className="font-display text-2xl font-bold text-slate-900">{top.name}</span>
              </div>
              <div className="text-sm text-slate-500">{top.trait}</div>
            </div>
          </div>
          <p className="mt-6 text-[15px] text-slate-600 max-w-prose mx-auto">{top.sub}</p>

          {/* Code de Holland */}
          {code && (
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-5 py-3">
              <span className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Code de Holland</span>
              <div className="flex items-center gap-1.5">
                {code.split("").map(letter => {
                  const p = RIASEC_PROFILES[letter as keyof typeof RIASEC_PROFILES]
                  return (
                    <span key={letter} className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white text-[13px]"
                      style={{ background: p?.tone }}>{letter}</span>
                  )
                })}
                <span className="ml-1 font-display text-[18px] font-bold text-slate-700">{code}</span>
              </div>
            </div>
          )}
          {hasExAequo && !code && <RiasecCodeSelector ranked={ranked} onCommit={handleCodeCommit} />}
        </div>

        <RiasecScoreBars ranked={ranked} total={total} />

        {/* Interprétation des 3 profils dominants */}
        <RiasecInterpretationsSection top3={top3} />

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
