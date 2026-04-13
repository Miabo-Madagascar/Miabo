"use client"
/**
 * ExternalYoungForm — champs profil jeune externe (CDC §6).
 * Utilisé dans AssessmentWizard à la création d'un bilan.
 */

import { Input } from "@/components/ui/Input"

export interface ExternalYoungFields {
  full_name:     string
  date_of_birth: string          // YYYY-MM-DD
  gender:        "M" | "F" | "autre" | ""
  region:        string
  quartier:      string
  school_name:   string
}

interface Props {
  values:   ExternalYoungFields
  onChange: (patch: Partial<ExternalYoungFields>) => void
}

const GENDERS = [
  { v: "M",     l: "Garçon" },
  { v: "F",     l: "Fille"  },
  { v: "autre", l: "Autre"  },
] as const

/** Calcule l'âge approximatif depuis une date ISO. */
function calcAge(dob: string): number | null {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  const age  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  return age >= 0 ? age : null
}

export function ExternalYoungForm({ values, onChange }: Props) {
  const age = calcAge(values.date_of_birth)
  const set = (k: keyof ExternalYoungFields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [k]: e.target.value })

  return (
    <div className="flex flex-col gap-4">
      <Input label="Nom complet" value={values.full_name} onChange={set("full_name")}
        placeholder="Ex : Jean Rakoto" required />

      {/* Date de naissance + âge calculé automatiquement */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input label="Date de naissance" type="date" value={values.date_of_birth}
            onChange={set("date_of_birth")} required />
        </div>
        {age !== null && (
          <div className="mb-1 flex h-10 shrink-0 items-center rounded-xl border border-border bg-bg-subtle px-4 text-sm font-semibold text-text-primary">
            {age} ans
          </div>
        )}
      </div>

      {/* Sexe */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">
          Sexe <span className="text-error" aria-hidden>*</span>
        </label>
        <div className="flex gap-2">
          {GENDERS.map(({ v, l }) => (
            <button key={v} type="button" onClick={() => onChange({ gender: v })}
              className={[
                "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                values.gender === v
                  ? "border-primary bg-primary-50 text-primary-700"
                  : "border-border text-text-secondary hover:bg-bg-subtle",
              ].join(" ")}
            >{l}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Région" value={values.region} onChange={set("region")}
          placeholder="Ex : Analamanga" required />
        <Input label="Quartier" value={values.quartier} onChange={set("quartier")}
          placeholder="Ex : Ambatonakanga" />
      </div>

      <Input label="École / Lycée" value={values.school_name} onChange={set("school_name")}
        placeholder="Ex : Lycée Andohalo" />
    </div>
  )
}
