"use client"
/**
 * Sélecteur de rôle à l'inscription — radio buttons stylisés.
 * Rôles autorisés : Élève, Tuteur, Parent.
 */

import { UserRole } from "@/types"

const REGISTRABLE_ROLES = [
  { value: UserRole.Student, label: "Élève" },
  { value: UserRole.Tutor,   label: "Tuteur" },
  { value: UserRole.Parent,  label: "Parent" },
]

interface RoleSelectorProps {
  value:    UserRole
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--text-primary)]">
        Vous êtes
      </span>
      <div className="flex gap-3">
        {REGISTRABLE_ROLES.map(({ value: roleValue, label }) => (
          <label
            key={roleValue}
            className={[
              "flex flex-1 cursor-pointer items-center justify-center",
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
      </div>
    </div>
  )
}
