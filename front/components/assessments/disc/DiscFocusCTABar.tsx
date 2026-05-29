interface Props {
  i:            number
  total:        number
  answeredCount: number
  profileTone:  string
  onPrev:       () => void
  onNext:       () => void
  onFinish:     () => void
}

export function DiscFocusCTABar({ i, total, answeredCount, profileTone, onPrev, onNext, onFinish }: Props) {
  const progress = (answeredCount / total) * 100

  return (
    <div className="fixed bottom-0 left-64 right-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between gap-4">
        <button onClick={onPrev} disabled={i === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition disabled:opacity-40 hover:bg-slate-50">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Précédent
        </button>

        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Progression</span>
            <span className="text-[11px] font-bold tabular-nums text-[var(--color-primary-500)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500))" }} />
          </div>
        </div>

        {i < total - 1 ? (
          <button onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:brightness-105"
            style={{ background: profileTone }}>
            Suivant
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        ) : (
          <button onClick={onFinish} disabled={answeredCount < total}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition disabled:opacity-40 bg-[var(--color-primary-500)]">
            Découvrir mes résultats
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
