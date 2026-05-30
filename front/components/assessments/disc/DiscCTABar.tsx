interface Props {
  isComplete: boolean
  loading:    boolean
  remaining:  number
  onCancel:   () => void
  onFocusMode: () => void
  onFinish:   () => void
}

export function DiscCTABar({ isComplete, loading, remaining, onCancel, onFocusMode, onFinish }: Props) {
  return (
    <div className="fixed bottom-0 left-64 right-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
        <div className="hidden sm:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Statut</div>
          <div className="text-[13px] font-semibold text-slate-900">
            {isComplete
              ? "Toutes les affirmations sont remplies."
              : `${remaining} affirmation${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onCancel}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition">
            Enregistrer & quitter
          </button>
          <button onClick={onFocusMode}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition">
            Mode Focus
          </button>
          <button onClick={onFinish} disabled={!isComplete || loading}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: isComplete ? "var(--color-primary-500)" : "#94a3b8" }}>
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Calcul en cours…
              </>
            ) : isComplete ? (
              <>
                Découvrir mes résultats
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            ) : (
              `Encore ${remaining} pour terminer`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
