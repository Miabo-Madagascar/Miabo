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

  const total         = VAK_QUESTIONS.length
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
      <VakFocusMode questions={VAK_QUESTIONS}
        answers={answers} setAnswers={setAnswers}
        onFinish={handleFinish} onExit={() => setMode("continuous")}
        likertStyle="numbers" />
    )
  }

  const grouped = VAK_ORDER.map(type => ({
    type,
    questions: VAK_QUESTIONS.filter(q => q.type === type),
  }))

  let absIdx = 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <DiscStickyHeader progress={progress} answered={answeredCount}
          total={total} onExit={onCancel} title="Profil VAK" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 pt-8 pb-32">
          <div className="min-w-0">
            <VakHero totalCount={total} />

            {grouped.map((group, gi) => {
              const sectionAnswered = group.questions.filter(q => answers[q.id] != null).length
              return (
                <section key={group.type}>
                  <VakSectionHeader
                    type={group.type}
                    indexLabel={`Rubrique ${gi + 1} / 3`}
                    answered={sectionAnswered}
                    total={group.questions.length} />
                  <div className="flex flex-col gap-4">
                    {group.questions.map(q => {
                      const idx = absIdx++
                      return (
                        <VakQuestionCard key={q.id} q={q} idx={idx}
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

          <VakSidebar scores={scores as Record<VakType, number>} currentType={null} />
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
