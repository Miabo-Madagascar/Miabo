"use client"

import { useState, useMemo } from "react"
import { DISC_QUESTIONS } from "./data/discQuestions"
import { DISC_ORDER } from "./data/discProfiles"
import type { DiscType } from "./data/discProfiles"
import { DiscStickyHeader } from "./disc/DiscStickyHeader"
import { DiscHero } from "./disc/DiscHero"
import { DiscSectionHeader } from "./disc/DiscSectionHeader"
import { DiscQuestionCard } from "./disc/DiscQuestionCard"
import { DiscSidebar } from "./disc/DiscSidebar"
import { DiscFocusMode } from "./disc/DiscFocusMode"
import { DiscResults } from "./disc/DiscResults"
import { DiscCTABar } from "./disc/DiscCTABar"

interface Props {
  onSave:   (scores: Record<string, number>) => Promise<void>
  onCancel: () => void
}

export function DiscTest({ onSave, onCancel }: Props) {
  const [answers, setAnswers]     = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [mode, setMode]           = useState<"continuous" | "focus">("continuous")
  const [loading, setLoading]     = useState(false)

  const total         = DISC_QUESTIONS.length
  const answeredCount = Object.keys(answers).length
  const progress      = (answeredCount / total) * 100
  const isComplete    = answeredCount === total

  const scores = useMemo(() => {
    const s: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 }
    DISC_QUESTIONS.forEach(q => { s[q.type] += (answers[q.id] ?? 0) })
    return s
  }, [answers])

  async function handleFinish() {
    setLoading(true)
    try { await onSave(scores) } finally { setLoading(false) }
    setSubmitted(true)
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
        onFinish={handleFinish} onExit={() => setMode("continuous")}
        likertStyle="numbers" />
    )
  }

  const grouped = DISC_ORDER.map(type => ({
    type,
    questions: DISC_QUESTIONS.filter(q => q.type === type),
  }))

  let absIdx = 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <DiscStickyHeader progress={progress} answered={answeredCount} total={total} onExit={onCancel} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 pt-8 pb-32">
          <div className="min-w-0">
            <DiscHero totalCount={total} />

            {grouped.map((group, gi) => {
              const sectionAnswered = group.questions.filter(q => answers[q.id] != null).length
              return (
                <section key={group.type}>
                  <DiscSectionHeader
                    type={group.type}
                    indexLabel={`Rubrique ${gi + 1} / 4`}
                    answered={sectionAnswered}
                    total={group.questions.length} />
                  <div className="flex flex-col gap-4">
                    {group.questions.map(q => {
                      const idx = absIdx++
                      return (
                        <DiscQuestionCard key={q.id} q={q} idx={idx}
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

          <DiscSidebar scores={scores as Record<DiscType, number>} currentType={null} />
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
