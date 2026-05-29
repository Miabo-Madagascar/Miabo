"use client"

import { useState, useMemo } from "react"
import { VAK_QUESTIONS } from "./data/vakQuestions"
import { VAK_ORDER } from "./data/vakProfiles"
import type { VakType } from "./data/vakProfiles"
import { DiscStickyHeader } from "./disc/DiscStickyHeader"
import { VakHero } from "./vak/VakHero"
import { VakSectionHeader } from "./vak/VakSectionHeader"
import { VakQuestionCard } from "./vak/VakQuestionCard"
import { VakSidebar } from "./vak/VakSidebar"
import { VakFocusMode } from "./vak/VakFocusMode"
import { VakResults } from "./vak/VakResults"
import { DiscCTABar } from "./disc/DiscCTABar"

interface Props {
  onSave:   (scores: Record<string, number>) => Promise<void>
  onCancel: () => void
}

export function VakTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers]     = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [mode, setMode]           = useState<"continuous" | "focus">("continuous")
  const [loading, setLoading]     = useState(false)

  /* Ordre aléatoire stable pour toute la session — évite de spoiler le type par regroupement */
  const shuffled = useMemo(() => {
    const arr = [...VAK_QUESTIONS]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  const total         = shuffled.length
  const answeredCount = Object.keys(answers).length
  const progress      = (answeredCount / total) * 100
  const isComplete    = answeredCount === total

  const scores = useMemo(() => {
    const s: Record<string, number> = { V: 0, A: 0, K: 0 }
    VAK_QUESTIONS.forEach(q => { s[q.type] += (answers[q.id] ?? 0) })
    return s
  }, [answers])

  async function handleFinish() {
    setLoading(true)
    try { await onSave(scores) } finally { setLoading(false) }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <VakResults scores={scores}
        onRetake={() => { setAnswers({}); setSubmitted(false) }}
        onBack={onCancel} />
    )
  }

  if (mode === "focus") {
    return (
      <VakFocusMode questions={shuffled}
        answers={answers} setAnswers={setAnswers}
        onFinish={handleFinish} onExit={() => setMode("continuous")}
        likertStyle="numbers" />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <DiscStickyHeader progress={progress} answered={answeredCount}
          total={total} onExit={onCancel} title="Profil VAK" />

        <div className="max-w-3xl mx-auto pt-8 pb-32">
          <VakHero totalCount={total} />

          <div className="flex flex-col gap-4 mt-6">
            {shuffled.map((q, idx) => (
              <VakQuestionCard key={q.id} q={q} idx={idx}
                value={answers[q.id]}
                onChange={(v) => setAnswers(p => ({ ...p, [q.id]: v }))}
                likertStyle="numbers" />
            ))}
          </div>
        </div>
      </div>

      <DiscCTABar isComplete={isComplete} loading={loading}
        remaining={total - answeredCount}
        onCancel={onCancel}
        onFocusMode={() => setMode("focus")}
        onFinish={handleFinish} />
    </div>
  )
}
