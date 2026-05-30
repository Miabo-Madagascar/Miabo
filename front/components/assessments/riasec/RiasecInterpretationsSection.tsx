"use client"

/**
 * Section d'interprétation RIASEC — affiche les 3 profils du code de Holland
 * avec tableau INTÉRÊTS / APTITUDES / TRAITS / CHAMPS pour chaque dimension.
 */

import { useState }                   from "react"
import { RIASEC_INTERPRETATIONS }     from "../data/riasecInterpretations"
import { RIASEC_PROFILES }            from "../data/riasecProfiles"

interface RankedProfile { letter: string; score: number; name: string; tone: string }

interface Props { top3: RankedProfile[] }

const ROWS: { key: keyof typeof RIASEC_INTERPRETATIONS["R"]; label: string }[] = [
  { key: "interets",  label: "Intérêts" },
  { key: "aptitudes", label: "Aptitudes" },
  { key: "traits",    label: "Traits de personnalité" },
  { key: "champs",    label: "Champs de métiers" },
]

export function RiasecInterpretationsSection({ top3 }: Props) {
  const [active, setActive] = useState(top3[0]?.letter ?? "")

  const profile = RIASEC_PROFILES[active]
  const interp  = RIASEC_INTERPRETATIONS[active]
  if (!profile || !interp) return null

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden">
      {/* Onglets */}
      <div className="flex border-b border-slate-100">
        {top3.map(p => (
          <button key={p.letter} onClick={() => setActive(p.letter)}
            className="flex-1 px-4 py-3 text-[12px] font-bold transition-colors"
            style={active === p.letter
              ? { color: profile.tone, borderBottom: `2px solid ${profile.tone}`, background: `${profile.tone}08` }
              : { color: "#94a3b8" }}>
            {p.letter} · {p.name}
          </button>
        ))}
      </div>

      {/* Contenu du profil actif */}
      <div className="p-6 space-y-4">
        <div className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ color: profile.tone }}>
          Profil {active} — Interprétation
        </div>
        {ROWS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[140px_1fr] gap-3 border-b border-slate-50 pb-3 last:border-0">
            <div className="text-[11px] font-bold uppercase tracking-[.1em] text-slate-400 pt-0.5">{label}</div>
            <div className="text-[13px] leading-relaxed text-slate-700">{interp[key]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
