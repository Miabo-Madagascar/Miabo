"use client"

/**
 * Résolution d'ex-aequo RIASEC : l'user ordonne uniquement les profils à score égal.
 * Les profils sans ex-aequo dans le top 3 sont placés automatiquement.
 *
 * Règles :
 * - Groupe ex-aequo de taille N pour N slots → l'user clique N-1 fois (le dernier auto-remplit)
 * - Groupe ex-aequo de taille M pour N slots (M > N) → l'user clique N fois
 * - Profil seul sur un slot → placé automatiquement, aucun clic nécessaire
 */

import { useState, useMemo } from "react"
import { RIASEC_PROFILES }   from "../data/riasecProfiles"

interface RankedProfile { letter: string; name: string; tone: string; score: number }
interface Props { ranked: RankedProfile[]; onCommit: (code: string) => void }

interface StepInfo {
  tiedProfiles: RankedProfile[]
  slotIndex:    number   // slot 0-indexé où commence ce groupe
  needCount:    number   // nb de slots top-3 que ce groupe occupe
  clicksNeeded: number   // nb de clics utilisateur requis
}

function computeFlow(ranked: RankedProfile[]): { steps: StepInfo[]; autoSlots: Map<number, string> } {
  const groups: { score: number; profiles: RankedProfile[] }[] = []
  for (const p of ranked) {
    const last = groups[groups.length - 1]
    if (last?.score === p.score) last.profiles.push(p)
    else groups.push({ score: p.score, profiles: [p] })
  }

  const steps: StepInfo[]        = []
  const autoSlots                = new Map<number, string>()
  let slot                       = 0

  for (const g of groups) {
    if (slot >= 3) break
    const slotsAvailable = 3 - slot

    if (g.profiles.length === 1) {
      autoSlots.set(slot, g.profiles[0].letter)
      slot++
    } else {
      const needCount    = Math.min(g.profiles.length, slotsAvailable)
      // Si tous les ex-aequo rentrent dans le top 3, le dernier s'auto-remplit
      const clicksNeeded = g.profiles.length > needCount ? needCount : needCount - 1
      steps.push({ tiedProfiles: g.profiles, slotIndex: slot, needCount, clicksNeeded })
      slot += needCount
    }
  }

  return { steps, autoSlots }
}

function buildPreviewSlots(
  steps: StepInfo[],
  autoSlots: Map<number, string>,
  picks: string[],
): (string | null)[] {
  const slots: (string | null)[] = [null, null, null]
  autoSlots.forEach((letter, i) => { slots[i] = letter })

  let pickIdx = 0
  for (const step of steps) {
    const stepPicks = picks.slice(pickIdx, pickIdx + step.clicksNeeded)
    for (let i = 0; i < stepPicks.length; i++) slots[step.slotIndex + i] = stepPicks[i]

    // Auto-remplit le dernier quand tous les ex-aequo rentrent dans le top 3
    if (step.tiedProfiles.length === step.needCount && stepPicks.length === step.clicksNeeded) {
      const last = step.tiedProfiles.find(p => !stepPicks.includes(p.letter))
      if (last) slots[step.slotIndex + stepPicks.length] = last.letter
    }
    pickIdx += step.clicksNeeded
  }

  return slots
}

function getCurrentStep(steps: StepInfo[], picks: string[]): { step: StepInfo; picksForStep: string[] } | null {
  let pickIdx = 0
  for (const step of steps) {
    const picksForStep = picks.slice(pickIdx, pickIdx + step.clicksNeeded)
    if (picksForStep.length < step.clicksNeeded) return { step, picksForStep }
    pickIdx += step.clicksNeeded
  }
  return null
}

const ORDINALS = ["1er", "2e", "3e"]

export function RiasecCodeSelector({ ranked, onCommit }: Props) {
  const { steps, autoSlots } = useMemo(() => computeFlow(ranked), [ranked])
  const [picks, setPicks]    = useState<string[]>([])

  const previewSlots    = buildPreviewSlots(steps, autoSlots, picks)
  const currentStepInfo = getCurrentStep(steps, picks)

  const handlePick = (letter: string) => {
    const next      = [...picks, letter]
    const preview   = buildPreviewSlots(steps, autoSlots, next)
    setPicks(next)
    if (preview.every(Boolean)) onCommit(preview.join(""))
  }

  if (!currentStepInfo) return null

  const { step, picksForStep } = currentStepInfo
  const remaining  = step.tiedProfiles.filter(p => !picksForStep.includes(p.letter))
  const nextSlot   = step.slotIndex + picksForStep.length

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-lg">⚖️</span>
        <div>
          <p className="text-[13px] font-bold text-amber-900">Ex-aequo détecté</p>
          <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
            Ces profils ont le même score&nbsp;({step.tiedProfiles[0].score}&nbsp;pts).{" "}
            Choisissez votre profil{" "}
            <strong>n°{nextSlot + 1}&nbsp;({ORDINALS[nextSlot]})</strong>{" "}
            selon votre observation et vécu&nbsp;:
          </p>
        </div>
      </div>

      {/* Aperçu du code en construction */}
      <div className="flex items-end gap-2 mb-5">
        {previewSlots.map((letter, i) => {
          const profile = letter ? RIASEC_PROFILES[letter as keyof typeof RIASEC_PROFILES] : null
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-bold transition-all ${
                  letter
                    ? "text-white shadow-sm"
                    : i === nextSlot
                    ? "bg-white border-2 border-amber-300 text-amber-400 animate-pulse"
                    : "bg-white border-2 border-dashed border-slate-200 text-slate-300"
                }`}
                style={profile ? { background: profile.tone } : {}}
              >
                {letter ?? "?"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                #{i + 1}
              </span>
            </div>
          )
        })}
      </div>

      {/* Choix disponibles — uniquement les profils du groupe ex-aequo courant */}
      <div className="flex flex-wrap gap-2">
        {remaining.map(p => (
          <button key={p.letter} onClick={() => handlePick(p.letter)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
              style={{ background: RIASEC_PROFILES[p.letter as keyof typeof RIASEC_PROFILES]?.tone }}>
              {p.letter}
            </span>
            <span className="text-[13px] font-bold">{p.name}</span>
            <span className="text-[11px] text-slate-400">{p.score}&nbsp;pts</span>
          </button>
        ))}
      </div>

      {picks.length > 0 && (
        <button onClick={() => setPicks([])}
          className="mt-3 text-[11px] text-slate-400 hover:text-slate-700 underline underline-offset-2">
          Recommencer
        </button>
      )}
    </div>
  )
}
