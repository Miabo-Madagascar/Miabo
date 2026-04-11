"use client"
/**
 * Sélecteur de rôle à l'inscription — radio buttons stylisés.
 * Rôles autorisés : Élève, Tuteur, Parent.
 */

import { UserRole } from "@/types"

const MAIN_ROLES = [
  { value: UserRole.Student, label: "Élève" },
  { value: UserRole.Tutor,   label: "Tuteur" },
  { value: UserRole.Parent,  label: "Parent" },
]

const OTHER_ROLES = [
  { value: UserRole.Canope, label: "CANOPE" },
  { value: UserRole.Cosp,   label: "COSP" },
]

interface RoleSelectorProps {
  value:    UserRole
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  // Détermine si le rôle actuel est un rôle "Autre" (Canope ou Cosp)
  const isOther = OTHER_ROLES.some(r => r.value === value)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Vous êtes
        </span>
        <div className="flex flex-wrap gap-3">
          {MAIN_ROLES.map(({ value: roleValue, label }) => (
            <label
              key={roleValue}
              className={[
                "flex flex-1 cursor-pointer items-center justify-center min-w-[80px]",
                "rounded-md border py-2 text-sm font-medium transition-colors",
                value === roleValue
                  ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="role"
                value={roleValue}
                checked={value === roleValue}
                onChange={() => onChange(roleValue)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
          
          <label
            className={[
              "flex flex-1 cursor-pointer items-center justify-center min-w-[80px]",
              "rounded-md border py-2 text-sm font-medium transition-colors",
              isOther
                ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
            ].join(" ")}
          >
            <input
              type="radio"
              name="role-category"
              checked={isOther}
              onChange={() => onChange(UserRole.Canope)} // Défaut "Autre" = Canope
              className="sr-only"
            />
            Autre
          </label>
        </div>
      </div>

      {/* Sous-sélection si "Autre" est choisi */}
      {isOther && (
        <div className="flex flex-col gap-1.5 rounded-lg bg-[var(--bg-muted)] p-3 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Type de compte partenaire
          </span>
          <div className="flex gap-2">
            {OTHER_ROLES.map(({ value: roleValue, label }) => (
              <button
                key={roleValue}
                type="button"
                onClick={() => onChange(roleValue)}
                className={[
                  "flex-1 rounded px-3 py-1.5 text-xs font-bold transition-all",
                  value === roleValue
                    ? "bg-white text-[var(--color-primary-600)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] italic">
            Les comptes CANOPE et COSP sont soumis à validation administrative.
          </p>
        </div>
      )}
    </div>
  )
}
