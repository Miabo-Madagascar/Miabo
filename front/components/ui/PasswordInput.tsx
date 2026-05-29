"use client"
/**
 * PasswordInput — champ mot de passe avec toggle de visibilité.
 */

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  error?: string
  hint?:  string
}

export function PasswordInput({ label, error, hint, className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {props.required && (
            <span className="ml-1 text-[var(--color-error)]" aria-hidden>*</span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn(
            "h-10 w-full rounded-md border px-3 pr-10 text-sm",
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

        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--color-error)]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--text-secondary)]">{hint}</p>
      )}
    </div>
  )
}
