/**
 * TutorProfileSection — champs spécifiques au tuteur dans le formulaire de profil.
 * Reçoit les valeurs et les callbacks de mise à jour depuis ProfileEditForm.
 */

import { Input } from "@/components/ui/Input"
import { GradeLevel } from "@/types"

const GRADE_LEVELS: { value: GradeLevel; label: string }[] = [
  { value: GradeLevel.Sixieme,   label: "6ème" },
  { value: GradeLevel.Cinquieme, label: "5ème" },
  { value: GradeLevel.Quatrieme, label: "4ème" },
  { value: GradeLevel.Troisieme, label: "3ème" },
  { value: GradeLevel.Seconde,   label: "2nde" },
  { value: GradeLevel.Premiere,  label: "1ère" },
  { value: GradeLevel.Terminale, label: "Tle"  },
  { value: GradeLevel.Superieur, label: "Sup." },
]

export interface TutorFields {
  bio:              string
  subjects:         string   // virgule-séparé
  hourly_rate:      string
  location:         string
  teaching_methods: string   // virgule-séparé
  grade_levels:     GradeLevel[]
}

interface TutorProfileSectionProps {
  values:   TutorFields
  onChange: (next: Partial<TutorFields>) => void
}

export function TutorProfileSection({ values, onChange }: TutorProfileSectionProps) {
  function toggleGrade(level: GradeLevel) {
    const next = values.grade_levels.includes(level)
      ? values.grade_levels.filter((g) => g !== level)
      : [...values.grade_levels, level]
    onChange({ grade_levels: next })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5">
      <h3 className="font-semibold text-[var(--text-primary)]">Informations tuteur</h3>

      {/* ── Bio ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Présentation
        </label>
        <textarea
          value={values.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          maxLength={1000}
          rows={3}
          placeholder="Décrivez votre expérience et votre méthode pédagogique…"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
        />
      </div>

      {/* ── Matières & tarif ───────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Matières enseignées (séparées par virgule)"
          value={values.subjects}
          onChange={(e) => onChange({ subjects: e.target.value })}
          placeholder="Maths, Physique, SVT"
        />
        <Input
          label="Tarif horaire (Ar)"
          type="number"
          min={2000}
          value={values.hourly_rate}
          onChange={(e) => onChange({ hourly_rate: e.target.value })}
        />
      </div>

      {/* ── Localisation & méthodes ────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Localisation"
          value={values.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Antananarivo, Ambohipo"
        />
        <Input
          label="Méthodes (séparées par virgule)"
          value={values.teaching_methods}
          onChange={(e) => onChange({ teaching_methods: e.target.value })}
          placeholder="Exercices, QCM, Exposé"
        />
      </div>

      {/* ── Niveaux scolaires ──────────────────────────────────── */}
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Niveaux enseignés</p>
        <div className="flex flex-wrap gap-2">
          {GRADE_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleGrade(value)}
              className={[
                "rounded-lg border px-3 py-1 text-sm font-medium transition-colors",
                values.grade_levels.includes(value)
                  ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
