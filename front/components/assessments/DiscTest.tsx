"use client"

import { useState, useMemo } from "react"
import { TestInstructionScreen } from "./TestInstructionScreen"
import { DISC_QUESTIONS } from "./data/discQuestions"
import { DiscStickyHeader } from "./disc/DiscStickyHeader"
import { DiscHero } from "./disc/DiscHero"
import { DiscChoiceCard } from "./disc/DiscChoiceCard"
import { DiscFocusMode } from "./disc/DiscFocusMode"
import { DiscResults } from "./disc/DiscResults"
import { DiscCTABar } from "./disc/DiscCTABar"

interface Props {
  onSave:   (scores: Record<string, number>) => Promise<void>
  onCancel: () => void
}

export function DiscTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [submitted, setSubmitted]   = useState(false)
  const [mode, setMode]             = useState<"continuous" | "focus">("continuous")
  const [loading, setLoading]       = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const total         = DISC_QUESTIONS.length
  const answeredCount = Object.keys(answers).length
  const progress      = (answeredCount / total) * 100
  const isComplete    = answeredCount === total

  /* Scoring : chaque choix apporte 1 point au type de l'option sélectionnée */
  const scores = useMemo(() => {
    const s: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 }
    DISC_QUESTIONS.forEach(q => {
      const key = answers[q.id]
      const opt = key ? q.options.find(o => o.key === key) : null
      if (opt) s[opt.type]++
    })
    return s
  }, [answers])

  async function handleFinish() {
    setLoading(true)
    try { await onSave(scores) } finally { setLoading(false) }
    setSubmitted(true)
  }

  if (showInstructions) {
    return (
      <TestInstructionScreen
        title="Test DISC"
        duration="~5 min"
        questions={DISC_QUESTIONS.length}
        accent="#dc2626"
        onStart={() => setShowInstructions(false)}
        onCancel={onCancel}
      />
    )
  }

  if (submitted) {
    return (
      <DiscResults scores={scores}
        onRetake={() => { setAnswers({}); setSubmitted(false) }}
        onBack={onCancel} />
    )
  }

  if (mode === "focus") {
    return (
      <DiscFocusMode questions={DISC_QUESTIONS}
        answers={answers} setAnswers={setAnswers}
        onFinish={handleFinish} onExit={() => setMode("continuous")} loading={loading} />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6">
        <DiscStickyHeader progress={progress} answered={answeredCount} total={total} onExit={onCancel} />

        <div className="pt-8 pb-32">
          <DiscHero totalCount={total} />
          <div className="flex flex-col gap-4 mt-8">
            {DISC_QUESTIONS.map((q, idx) => (
              <DiscChoiceCard
                key={q.id}
                id={q.id}
                idx={idx}
                options={q.options}
                value={answers[q.id]}
                onChange={(key) => setAnswers(p => ({ ...p, [q.id]: key }))}
              />
            ))}
          </div>
        </div>
      </div>

      <DiscCTABar
        isComplete={isComplete}
        loading={loading}
        remaining={total - answeredCount}
        onCancel={onCancel}
        onFocusMode={() => setMode("focus")}
        onFinish={handleFinish}
      />
    </div>
  )
}
