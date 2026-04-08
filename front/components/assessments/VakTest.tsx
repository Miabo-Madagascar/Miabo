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

  const isComplete = QUESTIONS.every(q => answers[q.id] !== undefined)

  const handleSave = async () => {
    setLoading(true)
    const scores = { v: 0, a: 0, k: 0 }
    QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0
      if (q.type === "V") scores.v += val
      if (q.type === "A") scores.a += val
      if (q.type === "K") scores.k += val
    })
    await onSave(scores)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Test VAK</h2>
        <Button variant="ghost" onClick={onCancel} size="sm">Fermer</Button>
      </div>

      <div className="flex flex-col gap-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-lg border p-4 bg-bg-base">
            <p className="mb-3 text-sm font-medium">{q.text}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setAnswers(p => ({ ...p, [q.id]: val }))}
                  className={`h-10 flex-1 rounded-md border text-sm transition-colors ${
                    answers[q.id] === val ? "bg-primary-500 text-white border-primary-600" : "hover:bg-bg-subtle"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-text-muted">
              <span>Jamais</span>
              <span>Souvent</span>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} isLoading={loading} disabled={!isComplete}>
        Enregistrer les scores VAK
      </Button>
    </div>
  )
}
