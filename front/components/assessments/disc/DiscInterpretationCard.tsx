/**
 * Carte d'interprétation DISC avec onglets — navigue entre les 4 profils.
 * Le profil dominant est mis en avant ; les autres sont consultables.
 */

"use client"

import { useState }              from "react"
import { DISC_INTERPRETATIONS } from "../data/discInterpretations"
import { DISC_PROFILES }        from "../data/discProfiles"

interface RankedProfile { letter: string; tone: string; name: string; score: number; pct: number }

interface Props {
  dominants: RankedProfile[]
  all:       RankedProfile[]   // les 4 profils classés par score
}

export function DiscInterpretationCard({ dominants, all }: Props) {
  const [active, setActive] = useState(dominants[0].letter)

  const profile  = DISC_PROFILES[active]
  const interp   = DISC_INTERPRETATIONS[active]
  const isDominant = dominants.some(p => p.letter === active)

  if (!interp || !profile) return null

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden">

      {/* Onglets — 4 profils */}
      <div className="flex border-b border-slate-100">
        {all.map(p => {
          const isActive = p.letter === active
          const isTop    = dominants.some(d => d.letter === p.letter)
          return (
            <button key={p.letter} onClick={() => setActive(p.letter)}
              className={`relative flex-1 flex flex-col items-center gap-1 px-2 py-3 transition-colors ${
                isActive ? "bg-white" : "bg-slate-50 hover:bg-white"
              }`}>
              {/* Barre de couleur active */}
              {isActive && (
                <span className="absolute inset-x-0 top-0 h-0.5 rounded-b" style={{ background: p.tone }} />
              )}
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold transition-all ${
                isActive ? "text-white shadow-sm" : "text-slate-500 bg-slate-100"
              }`} style={isActive ? { background: p.tone } : {}}>
                {p.letter}
              </span>
              <span className={`text-[10px] font-semibold hidden sm:block ${
                isActive ? "text-slate-900" : "text-slate-400"
              }`}>{DISC_PROFILES[p.letter]?.name}</span>
              <span className={`text-[10px] font-bold tabular-nums ${
                isActive ? "text-slate-600" : "text-slate-300"
              }`}>{p.pct}%</span>
              {isTop && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: p.tone }} />
              )}
            </button>
          )
        })}
      </div>

      {/* En-tête du profil actif */}
      <div className="px-6 py-4 border-b border-slate-100" style={{ background: `${profile.tone}0c` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
              style={{ background: profile.tone }}>{active}</span>
            <span className="text-[13px] font-bold" style={{ color: profile.tone }}>{profile.name}</span>
            <span className="text-[12px] text-slate-400">{profile.trait}</span>
          </div>
          {isDominant && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ background: profile.tone }}>
              Votre profil
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-[14px] leading-relaxed text-slate-600">{interp.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Forces */}
          <div className="rounded-2xl p-4" style={{ background: `${profile.tone}08` }}>
            <div className="text-[10px] font-bold uppercase tracking-[.14em] mb-2"
              style={{ color: profile.tone }}>
              Points forts
            </div>
            <ul className="space-y-1.5">
              {interp.forces.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none"
                    stroke="currentColor" strokeWidth="2.5" style={{ color: profile.tone }}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Défis */}
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-amber-600 mb-2">
              Points de vigilance
            </div>
            <ul className="space-y-1.5">
              {interp.defis.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"/>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Communication */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400 mb-1">
            Style de communication
          </div>
          <p className="text-[13px] leading-relaxed text-slate-700">{interp.communication}</p>
        </div>
      </div>
    </div>
  )
}
