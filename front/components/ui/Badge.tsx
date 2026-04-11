/**
 * Composant Badge — étiquette de statut avec variantes CVA.
 */

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:   "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
        primary:   "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]",
        secondary: "bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]",
        success:   "bg-emerald-100 text-emerald-700",
        warning:   "bg-amber-100 text-amber-700",
        danger:    "bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
