/**
 * Carte d'interprétation VAK — affiche description, méthode et conseils pour le profil dominant.
 */

import { VAK_INTERPRETATIONS } from "../data/vakInterpretations"
import { VAK_PROFILES }        from "../data/vakProfiles"

interface Props { dominantLetter: string }

export function VakInterpretationCard({ dominantLetter }: Props) {
  const interp  = VAK_INTERPRETATIONS[dominantLetter]
  const profile = VAK_PROFILES[dominantLetter]
  if (!interp || !profile) return null

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden">
      {/* En-tête coloré */}
      <div className="px-6 py-4 border-b border-slate-100" style={{ background: `${profile.tone}10` }}>
        <span className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ color: profile.tone }}>
          Profil {profile.letter} · {profile.name}
        </span>
        <h3 className="mt-1 font-display text-[17px] font-bold text-slate-900">
          Comment j&apos;apprends
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {/* Description */}
        <p className="text-[14px] leading-relaxed text-slate-600">{interp.description}</p>

        {/* Méthode de travail */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400 mb-2">
            Ma méthode de travail
          </div>
          <ul className="space-y-1.5">
            {interp.methode.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: profile.tone }}/>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Conseils pratiques */}
        <div className="rounded-2xl p-4" style={{ background: `${profile.tone}08` }}>
          <div className="text-[10px] font-bold uppercase tracking-[.14em] mb-2" style={{ color: profile.tone }}>
            Conseils pratiques
          </div>
          <ul className="space-y-1.5">
            {interp.conseils.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none"
                  stroke="currentColor" strokeWidth="2.5" style={{ color: profile.tone }}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
