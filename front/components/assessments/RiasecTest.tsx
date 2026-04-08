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

  const isComplete = QUESTIONS.every(q => answers[q.id] !== undefined)

  const handleSave = async () => {
    setLoading(true)
    const scores: any = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    QUESTIONS.forEach(q => {
      scores[q.type] += (answers[q.id] || 0)
    })
    await onSave(scores)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Test RIASEC</h2>
        <Button variant="ghost" onClick={onCancel} size="sm">Fermer</Button>
      </div>

      <div className="grid gap-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-lg border p-4 bg-bg-base shadow-xs">
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
                  {val === 1 ? "Non" : val === 5 ? "Oui !" : val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} isLoading={loading} disabled={!isComplete}>
        Enregistrer RIASEC
      </Button>
    </div>
  )
}
