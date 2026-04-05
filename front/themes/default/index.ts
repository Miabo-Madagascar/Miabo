/**
 * Thème par défaut MIABO — réexporte les tokens et expose
 * les variantes de composants pour CVA (class-variance-authority).
 *
 * Usage CVA :
 *   import { buttonVariants } from "@/themes/default"
 */

export { colors, typography, spacing, radius, shadows, transitions } from "@/lib/theme"

// ── Variantes de boutons ───────────────────────────────────────────────────

export const buttonVariants = {
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-md transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),

  variant: {
    primary:   "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]",
    secondary: "bg-[var(--color-secondary-500)] text-white hover:bg-[var(--color-secondary-600)]",
    outline:   "border border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-subtle)]",
    ghost:     "bg-transparent hover:bg-[var(--bg-muted)]",
    danger:    "bg-[var(--color-error)] text-white hover:opacity-90",
  },

  size: {
    sm:  "h-8  px-3 text-sm",
    md:  "h-10 px-4 text-base",
    lg:  "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  },
} as const

// ── Variantes de badges statut session ────────────────────────────────────

export const sessionStatusVariants: Record<string, string> = {
  pending:   "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
  confirmed: "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]",
  completed: "bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]",
  cancelled: "bg-red-100 text-red-700",
  disputed:  "bg-orange-100 text-orange-700",
}

// ── Variantes de badges statut tuteur ─────────────────────────────────────

export const tutorStatusVariants: Record<string, string> = {
  pending:   "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]",
  validated: "bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]",
  rejected:  "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
}

// ── Constantes de layout ───────────────────────────────────────────────────

export const layout = {
  maxWidth:       "1280px",
  sidebarWidth:   "260px",
  headerHeight:   "64px",
  mobileBreak:    "768px",
} as const
