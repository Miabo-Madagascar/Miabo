"use client"
/**
 * VakTest — questionnaire Styles d'Apprentissage.
 */

import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface Props {
  onSave: (scores: { v: number, a: number, k: number }) => Promise<void>
  onCancel: () => void
}

const QUESTIONS = [
  { id: 1,  text: "Quand je lis un livre, j'imagine les scènes dans ma tête.", type: "V" },
  { id: 2,  text: "J'aime écouter des podcasts ou la radio pour apprendre.", type: "A" },
  { id: 3,  text: "Je ne peux pas m'empêcher de bouger mes mains en parlant.", type: "K" },
  { id: 4,  text: "Les schémas, cartes et graphiques m'aident à comprendre.", type: "V" },
  { id: 5,  text: "Je préfère que l'on m'explique les choses à l'oral.", type: "A" },
  { id: 6,  text: "J'ai besoin de manipuler les objets pour comprendre comment ils marchent.", type: "K" },
  { id: 7,  text: "Je me souviens mieux des visages que des noms.", type: "V" },
  { id: 8,  text: "Je parle souvent tout seul quand je réfléchis.", type: "A" },
  { id: 9,  text: "J'aime les activités physiques, le sport ou la danse.", type: "K" },
  { id: 10, text: "Je suis sensible aux couleurs et à l'harmonie visuelle.", type: "V" },
  { id: 11, text: "Je reconnais facilement les voix au téléphone.", type: "A" },
  { id: 12, text: "J'apprends mieux en pratiquant qu'en lisant des instructions.", type: "K" },
]

export function VakTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / QUESTIONS.length) * 100
  const isComplete = answeredCount === QUESTIONS.length

  const handleSave = async () => {
    setLoading(true)
    try {
      // Accumulation des scores par type (clés internes uppercase pour correspondre à q.type)
      const totals: Record<string, number> = { V: 0, A: 0, K: 0 }
      QUESTIONS.forEach(q => {
        totals[q.type] += (answers[q.id] || 0)
      })
      // Remappage vers les clés lowercase attendues par onSave
      await onSave({ v: totals.V, a: totals.A, k: totals.K })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10 w-[70%]">
      {/* ── Header & Progress ────────────────────────────────────── */}
      <div className="sticky top-0 z-10 -mx-4 bg-bg-base/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Profil d&apos;apprentissage VAK</h2>
            <p className="text-sm text-text-secondary">Visualisez votre façon naturelle d&apos;apprendre.</p>
          </div>
          <Button variant="ghost" onClick={onCancel} size="sm" className="text-text-muted hover:text-error">
            Quitter
          </Button>
        </div>
        
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-text-muted">
          <span>0%</span>
          <span>{answeredCount} / {QUESTIONS.length} affirmations</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Questions ───────────────────────────────────────────── */}
      <div className="grid gap-6">
        {QUESTIONS.map((q, idx) => (
          <div 
            key={q.id} 
            className={`flex flex-col items-center group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
              answers[q.id] 
                ? "border-primary-100 bg-primary-50" 
                : "border-border bg-bg-base hover:border-primary-200 hover:shadow-sm"
            }`}
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-muted text-[10px] font-bold text-text-secondary group-hover:bg-primary-100 group-hover:text-primary">
                {idx + 1}
              </span>
              <p className="text-base font-medium leading-normal text-text-primary">{q.text}</p>
            </div>

            <div className="relative flex items-center w-[80%] justify-between gap-4 px-2 sm:px-12">
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-text-muted sm:block">Non</span>
              
              <div className="flex flex-1 items-center justify-around gap-5">
                {[1, 2, 3, 4, 5].map(val => {
                  const isSelected = answers[q.id] === val

                  return (
                    <button
                      key={val}
                      onClick={() => setAnswers(p => ({ ...p, [q.id]: val }))}
                      className={`h-10 w-10 flex items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 hover:scale-110 active:scale-90 ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/30" 
                          : "border-border text-text-secondary hover:border-primary-300 hover:text-primary"
                      }`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>

              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-text-muted sm:block">Oui !</span>
            </div>
          </div>
        ))}
      </div>
      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button 
          size="lg"
          onClick={handleSave} 
          isLoading={loading} 
          disabled={!isComplete}
          className={`w-full max-w-sm rounded-xl py-6 text-lg font-bold transition-all duration-300 ${
            isComplete ? "scale-105 shadow-primary-200" : "opacity-50"
          }`}
        >
          {isComplete ? "Enregistrer les scores VAK" : "Continuez pour voir votre profil"}
        </Button>
      </div>
    </div>
  )
}
