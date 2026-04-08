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

  const isComplete = QUESTIONS.every(q => answers[q.id] !== undefined)

  const handleSave = async () => {
    setLoading(true)
    const scores: any = { D: 0, I: 0, S: 0, C: 0 }
    QUESTIONS.forEach(q => {
      scores[q.type] += (answers[q.id] || 0)
    })
    await onSave(scores)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Test DISC</h2>
        <Button variant="ghost" onClick={onCancel} size="sm">Fermer</Button>
      </div>

      <div className="grid gap-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-lg border p-4 bg-bg-base">
            <p className="mb-3 text-sm font-medium">{q.text}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setAnswers(p => ({ ...p, [q.id]: val }))}
                  className={`h-10 flex-1 rounded-md border text-sm transition-colors ${
                    answers[q.id] === val ? "bg-primary-500 text-white" : "hover:bg-bg-subtle"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} isLoading={loading} disabled={!isComplete}>
        Enregistrer DISC
      </Button>
    </div>
  )
}
