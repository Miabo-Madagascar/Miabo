"use client"
/**
 * DiscTest — questionnaire Comportemental.
 */

import { useState } from "react"
import { Button } from "@/components/ui/Button"

interface Props {
  onSave: (scores: Record<string, number>) => Promise<void>
  onCancel: () => void
}

const QUESTIONS = [
  { id: 1, text: "Je suis direct et j'aime relever des nouveaux défis.", type: "D" },
  { id: 2, text: "Je suis enthousiaste et j'aime convaincre les autres.", type: "I" },
  { id: 3, text: "Je suis patient et j'apprécie la stabilité au travail.", type: "S" },
  { id: 4, text: "Je suis précis et j'aime suivre les règles établies.", type: "C" },
  { id: 5, text: "Je prends des décisions rapides, même sous pression.", type: "D" },
  { id: 6, text: "J'aime animer des réunions et faire des présentations.", type: "I" },
  { id: 7, text: "Je suis un bon auditeur et j'évite les conflits.", type: "S" },
  { id: 8, text: "Je vérifie toujours mon travail plusieurs fois.", type: "C" },
]

export function DiscTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / QUESTIONS.length) * 100
  const isComplete = answeredCount === QUESTIONS.length

  const handleSave = async () => {
    setLoading(true)
    try {
      const scores: any = { D: 0, I: 0, S: 0, C: 0 }
      QUESTIONS.forEach(q => {
        scores[q.type] += (answers[q.id] || 0)
      })
      await onSave(scores)
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
            <h2 className="text-2xl font-bold text-text-primary">Test de personnalité DISC</h2>
            <p className="text-sm text-text-secondary">Répondez honnêtement selon votre ressenti actuel.</p>
          </div>
          <Button variant="ghost" onClick={onCancel} size="sm" className="text-text-muted hover:text-error">
            Abandonner
          </Button>
        </div>
        
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-text-muted">
          <span>Début</span>
          <span>{Math.round(progress)}% terminé</span>
          <span>Fin</span>
        </div>
      </div>

      {/* ── Questions ───────────────────────────────────────────── */}
      <div className="grid gap-8">
        {QUESTIONS.map((q, idx) => (
          <div 
            key={q.id} 
            className={`flex flex-col items-center group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
              answers[q.id] 
                ? "border-primary-100 bg-primary-50" 
                : "border-border bg-bg-base hover:border-primary-200 hover:shadow-md"
            }`}
          >
            <div className="mb-6 flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-muted text-xs font-bold text-text-secondary group-hover:bg-primary-100 group-hover:text-primary">
                {idx + 1}
              </span>
              <p className="text-lg font-medium leading-tight text-text-primary">{q.text}</p>
            </div>

            <div className="relative flex items-center w-[80%] justify-between gap-2 px-2 sm:px-10">
              <span className="hidden text-[10px] font-bold uppercase tracking-tighter text-text-muted sm:block">Désaccord</span>
              
              <div className="flex flex-1 items-center justify-around gap-5 sm:gap-4">
                {[1, 2, 3, 4, 5].map(val => {
                  const isSelected = answers[q.id] === val
                  const sizes = ["h-12 w-12", "h-10 w-10", "h-8 w-8", "h-10 w-10", "h-12 w-12"]

                  return (
                    <button
                      key={val}
                      onClick={() => setAnswers(p => ({ ...p, [q.id]: val }))}
                      className={`relative flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${sizes[val-1]} ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-lg" 
                          : "border-border hover:border-primary-300 text-text-secondary"
                      }`}
                      title={val === 1 ? "Pas du tout d'accord" : val === 5 ? "Tout à fait d'accord" : ""}
                    >
                      {isSelected ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      ) : (
                        <span className="text-[10px] font-medium opacity-50">{val}</span>
                      )}
                    </button>
                  )
                })}
              </div>

              <span className="hidden text-[10px] font-bold uppercase tracking-tighter text-text-muted sm:block">Accord</span>
            </div>
            
            {/* Labels mobiles */}
            <div className="mt-2 flex justify-between px-2 text-[9px] font-bold uppercase text-text-muted sm:hidden">
              <span>Non</span>
              <span>Indifférent</span>
              <span>Oui</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {!isComplete && (
          <p className="text-sm text-text-muted italic animate-bounce">
            Encore {QUESTIONS.length - answeredCount} questions pour terminer...
          </p>
        )}
        <Button 
          size="lg"
          onClick={handleSave} 
          isLoading={loading} 
          disabled={!isComplete}
          className={`w-full max-w-xs rounded-full py-6 text-lg font-bold shadow-xl transition-all duration-300 ${
            isComplete ? "scale-105 shadow-primary-200" : "opacity-50"
          }`}
        >
          {isComplete ? "Découvrir mes résultats" : "Compléter le test"}
        </Button>
      </div>
    </div>
  )
}
