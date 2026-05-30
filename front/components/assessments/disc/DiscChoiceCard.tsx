"use client"

import type { DiscOption } from "../data/discQuestions"

interface Props {
  id:       number
  idx:      number
  options:  DiscOption[]
  value:    string | undefined
  onChange: (key: string) => void
}

const KEY_LABELS: Record<string, string> = { a: "A", b: "B", c: "C", d: "D" }

export function DiscChoiceCard({ id, idx, options, value, onChange }: Props) {
  const answered = value != null

  return (
    <article className={`rounded-2xl border bg-white px-6 py-5 transition-all duration-300 ${
      answered ? "border-slate-200 shadow-[0_1px_0_rgba(0,0,0,.02)]" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-6 min-w-[28px] px-1.5 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500 tabular-nums">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <p className="text-[13px] font-medium text-slate-500">
          Choisissez le mot qui vous correspond le mieux :
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(opt => {
          const selected = value === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                selected
                  ? "border-[var(--color-primary-500)] bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                selected ? "bg-[var(--color-primary-500)] text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {KEY_LABELS[opt.key]}
              </span>
              <span className={`text-[14px] font-medium leading-snug ${selected ? "text-slate-900" : "text-slate-700"}`}>
                {opt.text}
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
