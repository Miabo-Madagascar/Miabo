"use client"

import { useState, useEffect } from "react"
import type { DiscChoiceQuestion } from "../data/discQuestions"
import { DiscFocusTopBar } from "./DiscFocusTopBar"
import { DiscFocusCTABar } from "./DiscFocusCTABar"

interface Props {
  questions:  DiscChoiceQuestion[]
  answers:    Record<number, string>
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  onFinish:   () => void
  onExit:     () => void
}

/* Clavier : 1/2/3/4 → a/b/c/d */
const KEY_MAP: Record<string, "a" | "b" | "c" | "d"> = { "1": "a", "2": "b", "3": "c", "4": "d" }
const OPTION_LABELS = ["A", "B", "C", "D"]

export function DiscFocusMode({ questions, answers, setAnswers, onFinish, onExit }: Props) {
  const [i, setI] = useState(() => {
    const idx = questions.findIndex(q => answers[q.id] == null)
    return idx === -1 ? 0 : idx
  })

  const q     = questions[i]
  const value = answers[q.id]

  const next = () => { if (i < questions.length - 1) setI(i + 1); else onFinish() }
  const prev = () => { if (i > 0) setI(i - 1) }

  /* Avancement automatique 320 ms après réponse */
  useEffect(() => {
    if (value != null) {
      const t = setTimeout(() => { if (i < questions.length - 1) setI(i + 1) }, 320)
      return () => clearTimeout(t)
    }
  }, [value, i, questions.length])

  /* Navigation clavier : 1-4 pour répondre, ←→ pour naviguer */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (KEY_MAP[e.key]) setAnswers(p => ({ ...p, [q.id]: KEY_MAP[e.key] }))
      else if (e.key === "ArrowRight") next()
      else if (e.key === "ArrowLeft")  prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, q.id])

  const answeredCount = Object.keys(answers).length

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] opacity-25"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, #3a6cf818, transparent 70%)" }} />

      <DiscFocusTopBar i={i} questions={questions} answers={answers} onNavigate={setI} onExit={onExit} />

      <div className="relative z-10 mx-auto max-w-2xl px-6 pt-10 pb-40">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
          Question {i + 1} / {questions.length}
        </div>

        <p className="font-display text-[26px] sm:text-[32px] leading-[1.15] font-bold tracking-tight text-slate-900 mb-8">
          Quel mot vous décrit le mieux ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, ki) => {
            const selected = value === opt.key
            return (
              <button key={opt.key} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.key }))}
                className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition-all duration-150 ${
                  selected
                    ? "border-[var(--color-primary-500)] bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold ${
                  selected ? "bg-[var(--color-primary-500)] text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {OPTION_LABELS[ki]}
                </span>
                <span className={`text-[15px] font-medium leading-snug ${selected ? "text-slate-900" : "text-slate-700"}`}>
                  {opt.text}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          {["1","2","3","4"].map(k => (
            <kbd key={k} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-600">{k}</kbd>
          ))}
          <span className="mx-2 text-slate-300">·</span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-600">←</kbd>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-600">→</kbd>
          <span className="ml-1">naviguer</span>
        </div>
      </div>

      <DiscFocusCTABar i={i} total={questions.length} answeredCount={answeredCount}
        profileTone="var(--color-primary-500)" onPrev={prev} onNext={next} onFinish={onFinish} />
    </div>
  )
}
