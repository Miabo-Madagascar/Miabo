/**
 * TestLayout — enveloppe commune pour les tests VAK, RIASEC et DISC.
 * Gère le header sticky, la description, l'instruction et le footer de soumission.
 */

import { Button } from "@/components/ui/Button"

interface TestLayoutProps {
  title:         string
  description:   string
  illustration?: React.ReactNode
  progress:      number
  answeredCount: number
  totalCount:    number
  unitLabel:     string
  isComplete:    boolean
  isLoading:     boolean
  submitLabel:   string
  onCancel:      () => void
  onSubmit:      () => void
  children:      React.ReactNode
}

export function TestLayout({
  title, description, illustration, progress, answeredCount, totalCount, unitLabel,
  isComplete, isLoading, submitLabel, onCancel, onSubmit, children,
}: TestLayoutProps) {
  return (
    <div className="flex flex-col gap-8 pb-10 w-[70%]">
      {/* ── Header sticky ──────────────────────────────────────── */}
      <div className="sticky top-0 z-10 -mx-4 bg-bg-base/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <Button variant="ghost" onClick={onCancel} size="sm" className="text-text-muted hover:text-error">
            Quitter
          </Button>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-text-muted">
          <span>0%</span>
          <span>{answeredCount} / {totalCount} {unitLabel}</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Image illustrative ──────────────────────────────────── */}
      {illustration && (
        <div className="flex justify-center rounded-2xl border border-border bg-bg-base p-6 shadow-sm">
          {illustration}
        </div>
      )}

      {/* ── Description du test (sous l'illustration) ───────────── */}
      <div className="rounded-xl border border-border bg-bg-subtle p-4 text-sm text-text-secondary leading-relaxed">
        {description}
      </div>

      {/* ── Instruction avant remplissage ───────────────────────── */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 italic">
        Veuillez répondre honnêtement et de manière spontanée. Bon test.
      </div>

      {/* ── Questions ───────────────────────────────────────────── */}
      <div className="grid gap-6">
        {children}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={onSubmit}
          isLoading={isLoading}
          disabled={!isComplete}
          className={`w-full max-w-sm rounded-xl py-6 text-lg font-bold transition-all duration-300 ${
            isComplete ? "scale-105 shadow-primary-200" : "opacity-50"
          }`}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
