"use client"

import { useState, useMemo } from "react"
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
  onSave:   (scores: Record<string, number>) => Promise<void>
  onCancel: () => void
}

export function RiasecTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers]     = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [mode, setMode]           = useState<"continuous" | "focus">("continuous")
  const [loading, setLoading]     = useState(false)

  const total         = RIASEC_QUESTIONS.length
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

  if (submitted) {
    return (
      <RiasecResults scores={scores}
        onRetake={() => { setAnswers({}); setSubmitted(false) }}
        onBack={onCancel} />
    )
  }

  if (mode === "focus") {
    return (
      <RiasecFocusMode questions={RIASEC_QUESTIONS}
        answers={answers} setAnswers={setAnswers}
        onFinish={handleFinish} onExit={() => setMode("continuous")}
        likertStyle="numbers" />
    )
  }

  const grouped = RIASEC_ORDER.map(type => ({
    type,
    questions: RIASEC_QUESTIONS.filter(q => q.type === type),
  }))

  let absIdx = 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <DiscStickyHeader progress={progress} answered={answeredCount}
          total={total} onExit={onCancel} title="Test RIASEC" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 pt-8 pb-32">
          <div className="min-w-0">
            <RiasecHero totalCount={total} />

            {grouped.map((group, gi) => {
              const sectionAnswered = group.questions.filter(q => answers[q.id] != null).length
              return (
                <section key={group.type}>
                  <RiasecSectionHeader
                    type={group.type}
                    indexLabel={`Rubrique ${gi + 1} / 6`}
                    answered={sectionAnswered}
                    total={group.questions.length} />
                  <div className="flex flex-col gap-4">
                    {group.questions.map(q => {
                      const idx = absIdx++
                      return (
                        <RiasecQuestionCard key={q.id} q={q} idx={idx}
                          value={answers[q.id]}
                          onChange={(v) => setAnswers(p => ({ ...p, [q.id]: v }))}
                          likertStyle="numbers" />
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>

          <RiasecSidebar scores={scores as Record<RiasecType, number>} currentType={null} />
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
