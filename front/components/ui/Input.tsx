/**
 * Composant Input — champ de formulaire avec label et message d'erreur.
 */

import { cn } from "@/lib/utils/cn"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-[var(--color-error)]" aria-hidden>*</span>
          )}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          "h-10 w-full rounded-md border px-3 text-sm",
          "bg-[var(--bg-base)] text-[var(--text-primary)]",
          "transition-colors duration-[var(--transition-fast)]",
          "placeholder:text-[var(--text-disabled)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
            : "border-[var(--border-default)]",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--text-secondary)]">{hint}</p>
      )}
    </div>
  )
}
