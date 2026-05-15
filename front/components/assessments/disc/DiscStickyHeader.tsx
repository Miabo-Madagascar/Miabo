interface Props {
  progress: number
  answered: number
  total:    number
  onExit:   () => void
  title?:   string
}

export function DiscStickyHeader({ progress, answered, total, onExit, title = "Test DISC" }: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-6 px-6 backdrop-blur-md bg-white/85 border-b border-slate-200/70">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3 text-[12px] font-medium text-slate-500">
          <button onClick={onExit} className="hover:text-slate-900 transition-colors">Bilan SESAME</button>
          <span aria-hidden className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-[var(--color-primary-500)]" />
            Brouillon enregistré
          </span>
          <button onClick={onExit}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
            Quitter
          </button>
        </div>
      </div>

      <div className="pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-900 tabular-nums">
            {answered}
            <span className="text-slate-400 font-medium"> / {total} affirmations</span>
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-[var(--color-primary-500)]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width:      `${progress}%`,
              background: "linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500))",
            }} />
        </div>
      </div>
    </header>
  )
}
