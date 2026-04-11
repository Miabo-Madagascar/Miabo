/**
 * Composant Button — primitif avec variantes CVA.
 * Variantes : primary | secondary | outline | ghost | danger
 * Tailles    : sm | md | lg | icon
 */

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium rounded-md",
    "transition-colors duration-[var(--transition-base)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)]",
        secondary:
          "bg-[var(--color-secondary-500)] text-white hover:bg-[var(--color-secondary-600)]",
        outline:
          "border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]",
        ghost:
          "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-muted)]",
        danger:
          "bg-[var(--color-error)] text-white hover:opacity-90",
      },
      size: {
        sm:   "h-8 px-3 text-sm",
        md:   "h-10 px-4 text-base",
        lg:   "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
