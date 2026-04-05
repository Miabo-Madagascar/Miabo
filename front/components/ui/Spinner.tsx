/**
 * Composant Spinner — indicateur de chargement accessible.
 */

import { cn } from "@/lib/utils/cn"

interface SpinnerProps {
  size?:      "sm" | "md" | "lg"
  className?: string
  label?:     string   // texte pour screen readers
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
}

export function Spinner({ size = "md", className, label = "Chargement…" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <span
        className={cn(
          "animate-spin rounded-full border-[var(--color-primary-200)] border-t-[var(--color-primary-500)]",
          sizeMap[size],
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** Ecran de chargement plein écran */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
      <Spinner size="lg" />
    </div>
  )
}
