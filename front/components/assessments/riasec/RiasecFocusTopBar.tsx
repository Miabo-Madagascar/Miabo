import { RIASEC_PROFILES } from "../data/riasecProfiles"
import type { RiasecQuestion } from "../data/riasecQuestions"

interface Props {
  i:          number
  questions:  RiasecQuestion[]
  answers:    Record<number, number>
  onNavigate: (idx: number) => void
  onExit:     () => void
}

export function RiasecFocusTopBar({ i, questions, answers, onNavigate, onExit }: Props) {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-6 pt-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="font-display text-[13px] font-bold text-slate-900">Test RIASEC</span>
          <span className="h-4 w-px bg-slate-300" />
          <span className="text-[12px] font-medium text-slate-500">
            Question {i + 1} / {questions.length}
          </span>
        </div>
        <button onClick={onExit}
          className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
          Quitter
        </button>
      </div>

      <div className="flex items-center gap-1">
        {questions.map((qq, idx) => {
          const p   = RIASEC_PROFILES[qq.type]
          const ans = answers[qq.id] != null
          return (
            <button key={qq.id} onClick={() => onNavigate(idx)}
              className="group flex-1 py-2" title={`Question ${idx + 1} · ${p.name}`}>
              <span className="block h-1 w-full rounded-full transition-all"
                style={{
                  background: ans ? p.tone : idx === i ? p.tone : idx < i ? "#cbd5e1" : "#e2e8f0",
                  opacity:    ans ? 1 : idx === i ? 0.45 : 1,
                }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
