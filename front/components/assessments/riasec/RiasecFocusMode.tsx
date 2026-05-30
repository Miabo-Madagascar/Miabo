"use client"

import { useState, useEffect } from "react"
import type { RiasecQuestion } from "../data/riasecQuestions"
import { RIASEC_PROFILES } from "../data/riasecProfiles"
import { RiasecProfileIllustration } from "./RiasecProfileIllustration"
import { DiscLikert, LikertStyle } from "../disc/DiscLikert"
import { RiasecFocusTopBar } from "./RiasecFocusTopBar"
import { DiscFocusCTABar } from "../disc/DiscFocusCTABar"

interface Props {
  questions:   RiasecQuestion[]
  answers:     Record<number, number>
  setAnswers:  React.Dispatch<React.SetStateAction<Record<number, number>>>
  onFinish:    () => void
  onExit:      () => void
  likertStyle: LikertStyle
  loading?:    boolean
}

export function RiasecFocusMode({ questions, answers, setAnswers, onFinish, onExit, likertStyle, loading = false }: Props) {
  const [i, setI] = useState(() => {
    const idx = questions.findIndex(q => answers[q.id] == null)
    return idx === -1 ? 0 : idx
  })

  const q       = questions[i]
  const profile = RIASEC_PROFILES[q.type]
  const value   = answers[q.id]

  const next = () => { if (i < questions.length - 1) setI(i + 1); else onFinish() }
  const prev = () => { if (i > 0) setI(i - 1) }

  useEffect(() => {
    if (value != null) {
      const t = setTimeout(() => { if (i < questions.length - 1) setI(i + 1) }, 320)
      return () => clearTimeout(t)
    }
  }, [value, i, questions.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["1","2","3","4","5"].includes(e.key)) {
        setAnswers(p => ({ ...p, [q.id]: parseInt(e.key, 10) }))
      } else if (e.key === "ArrowRight") next()
      else if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, q.id])

  const answeredCount = Object.keys(answers).length

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Halo neutre */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-30"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, #6366f118, transparent 70%)" }} />

      <RiasecFocusTopBar i={i} questions={questions} answers={answers}
        onNavigate={setI} onExit={onExit} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-10 pb-40">
        <p className="font-display text-[34px] sm:text-[44px] leading-[1.1] font-bold tracking-tight text-slate-900 max-w-[22ch]">
          {q.text}
        </p>

        <div className="mt-12">
          <DiscLikert style={likertStyle} value={value}
            onChange={(v) => setAnswers(p => ({ ...p, [q.id]: v }))}
            accent="#6366f1" />
        </div>

        <div className="mt-8 hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          {["1","2","3","4","5"].map(k => (
            <kbd key={k} className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-600">{k}</kbd>
          ))}
          <span className="mx-2 text-slate-300">·</span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-600">←</kbd>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-semibold text-slate-600">→</kbd>
          <span className="ml-1">naviguer</span>
        </div>
      </div>

      <DiscFocusCTABar i={i} total={questions.length} answeredCount={answeredCount}
        profileTone="#6366f1" loading={loading} onPrev={prev} onNext={next} onFinish={onFinish} />
    </div>
  )
}
