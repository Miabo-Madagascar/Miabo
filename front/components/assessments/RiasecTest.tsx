"use client"
/**
 * RiasecTest — questionnaire Intérêts Professionnels.
 */

import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface Props {
  onSave: (scores: Record<string, number>) => Promise<void>
  onCancel: () => void
}

const DIMENSIONS = ["R", "I", "A", "S", "E", "C"]
const QUESTIONS = [
  { id: 1,  text: "J'aime réparer des appareils électriques ou mécaniques.", type: "R" },
  { id: 2,  text: "J'aime faire des recherches scientifiques ou mathématiques.", type: "I" },
  { id: 3,  text: "J'aime dessiner, peindre ou sculpter.", type: "A" },
  { id: 4,  text: "J'aime aider les autres à résoudre leurs problèmes.", type: "S" },
  { id: 5,  text: "J'aime diriger une équipe ou influencer les autres.", type: "E" },
  { id: 6,  text: "J'aime organiser des fichiers, des données ou des horaires.", type: "C" },
  { id: 7,  text: "J'aime travailler en plein air.", type: "R" },
  { id: 8,  text: "J'aime comprendre le fonctionnement des choses complexes.", type: "I" },
  { id: 9,  text: "J'aime écrire des histoires ou des poèmes.", type: "A" },
  { id: 10, text: "J'aime enseigner ou transmettre mes connaissances.", type: "S" },
  { id: 11, text: "J'aime convaincre les gens d'acheter un produit.", type: "E" },
  { id: 12, text: "J'aime le travail précis qui demande de la rigueur.", type: "C" },
]

export function RiasecTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / QUESTIONS.length) * 100
  const isComplete = answeredCount === QUESTIONS.length

  const handleSave = async () => {
    setLoading(true)
    try {
      const scores: any = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
      QUESTIONS.forEach(q => {
        scores[q.type] += (answers[q.id] || 0)
      })
      await onSave(scores)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ── Header & Progress ────────────────────────────────────── */}
      <div className="sticky top-0 z-10 -mx-4 bg-bg-base/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Test d&apos;intérêts RIASEC</h2>
            <p className="text-sm text-text-secondary">Quelles activités vous attirent le plus ?</p>
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
          <span>{answeredCount} / {QUESTIONS.length} activités</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Questions ───────────────────────────────────────────── */}
      <div className="grid gap-6">
        {QUESTIONS.map((q, idx) => (
          <div 
            key={q.id} 
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
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

            <div className="relative flex items-center justify-between gap-4 px-2 sm:px-12">
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-text-muted sm:block">Je déteste</span>
              
              <div className="flex flex-1 items-center justify-around gap-2">
                {[1, 2, 3, 4, 5].map(val => {
                  const isSelected = answers[q.id] === val

                  return (
                    <button
                      key={val}
                      onClick={() => setAnswers(p => ({ ...p, [q.id]: val }))}
                      className={`h-11 w-11 flex items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 hover:shadow-sm active:scale-90 ${
                        isSelected 
                          ? "bg-primary border-primary text-white scale-110 shadow-md shadow-primary/30" 
                          : "border-border text-text-secondary hover:border-primary-300 hover:text-primary"
                      }`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>

              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-text-muted sm:block">J&apos;adore !</span>
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
            isComplete ? "bg-secondary-600 hover:bg-secondary-700 shadow-xl shadow-secondary-100" : "opacity-40"
          }`}
        >
          {isComplete ? "Continuer vers le résultat" : `Complétez encore ${QUESTIONS.length - answeredCount} élements`}
        </Button>
      </div>
    </div>
  )
}
