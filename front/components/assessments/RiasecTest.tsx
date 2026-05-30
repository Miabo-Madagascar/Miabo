"use client"

import { useState, useMemo } from "react"
import { TestInstructionScreen } from "./TestInstructionScreen"
import { RIASEC_QUESTIONS } from "./data/riasecQuestions"
import { RIASEC_ORDER } from "./data/riasecProfiles"
import type { RiasecType } from "./data/riasecProfiles"
import { DiscStickyHeader } from "./disc/DiscStickyHeader"
import { RiasecHero } from "./riasec/RiasecHero"
import { RiasecSectionHeader } from "./riasec/RiasecSectionHeader"
import { RiasecQuestionCard } from "./riasec/RiasecQuestionCard"
import { RiasecSidebar } from "./riasec/RiasecSidebar"
import { RiasecFocusMode } from "./riasec/RiasecFocusMode"
import { RiasecResults } from "./riasec/RiasecResults"
import { DiscCTABar } from "./disc/DiscCTABar"

interface Props {
  onSave:         (scores: Record<string, number>) => Promise<void>
  onCancel:       () => void
  onCodeUpdate?:  (code: string) => Promise<void>
}

export function RiasecTest({ onSave, onCancel, onCodeUpdate }: Props) {
  const [answers, setAnswers]       = useState<Record<number, number>>({})
  const [submitted, setSubmitted]   = useState(false)
  const [mode, setMode]             = useState<"continuous" | "focus">("continuous")
  const [loading, setLoading]       = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  /* Ordre aléatoire stable pour toute la session */
  const shuffled = useMemo(() => {
    const arr = [...RIASEC_QUESTIONS]
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
    const s: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    RIASEC_QUESTIONS.forEach(q => { s[q.type] += (answers[q.id] ?? 0) })
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
        title="Test RIASEC"
        duration="~10 min"
        questions={total}
        accent="#be185d"
        onStart={() => setShowInstructions(false)}
        onCancel={onCancel}
      />
    )
  }

  if (submitted) {
    return (
      <RiasecResults scores={scores}
        onCodeUpdate={onCodeUpdate}
        onRetake={() => { setAnswers({}); setSubmitted(false) }}
        onBack={onCancel} />
    )
  }

  if (mode === "focus") {
    return (
      <RiasecFocusMode questions={shuffled}
        answers={answers} setAnswers={setAnswers}
        onFinish={handleFinish} onExit={() => setMode("continuous")}
        likertStyle="numbers" loading={loading} />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <DiscStickyHeader progress={progress} answered={answeredCount}
          total={total} onExit={onCancel} title="Test RIASEC" />

        <div className="max-w-3xl mx-auto pt-8 pb-32">
          <RiasecHero totalCount={total} />

          <div className="flex flex-col gap-4 mt-6">
            {shuffled.map((q, idx) => (
              <RiasecQuestionCard key={q.id} q={q} idx={idx}
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
