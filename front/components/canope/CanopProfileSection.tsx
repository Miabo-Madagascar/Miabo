"use client"
/**
 * CanopProfileSection — champs spécifiques au profil CANOPE/COSP (CDC AUTH-008).
 * Identité · Adresse · Profil professionnel · Formation COSP
 */

import { Input } from "@/components/ui/Input"
import type { CanopProfileType } from "@/types"

export interface CanopFields {
  first_name:          string
  last_name:           string
  date_of_birth:       string
  gender:              "M" | "F" | "autre" | ""
  address:             string
  city:                string
  region:              string
  profession:          string
  profile_type:        CanopProfileType | ""
  profile_other:       string
  education_level:     string
  cosp_training_dates: string[]  // ISO YYYY-MM-DD
}

interface Props {
  values:   CanopFields
  isCosp:   boolean
  sesame:   string           // code SESAME lu seul
  onChange: (patch: Partial<CanopFields>) => void
}

const GENDERS   = [{ v: "M", l: "Homme" }, { v: "F", l: "Femme" }, { v: "autre", l: "Autre" }] as const
const PROFILES  = [
  { v: "etudiant", l: "Étudiant" },
  { v: "tuteur",   l: "Tuteur" },
  { v: "parent",   l: "Parent" },
  { v: "autre",    l: "Autre" },
] as const

export function CanopProfileSection({ values, isCosp, sesame, onChange }: Props) {
  const set = (key: keyof CanopFields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value })

  return (
    <div className="flex flex-col gap-6">
      {/* ── Code SESAME (lecture seule) ─────────────────────────── */}
      <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 px-5 py-4">
        <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">Code SESAME</p>
          <p className="font-mono text-sm font-bold text-text-primary">{sesame || "—"}</p>
        </div>
      </div>

      {/* ── Identité ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-bg-base p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-text-primary">Identité</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Prénom" value={values.first_name} onChange={set("first_name")} required />
          <Input label="Nom" value={values.last_name} onChange={set("last_name")} required />
          <Input label="Date de naissance" type="date" value={values.date_of_birth} onChange={set("date_of_birth")} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Sexe <span className="text-error" aria-hidden>*</span>
          </label>
          <div className="flex gap-2">
            {GENDERS.map(({ v, l }) => (
              <button key={v} type="button" onClick={() => onChange({ gender: v })}
                className={["flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                  values.gender === v
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-border text-text-secondary hover:bg-bg-subtle",
                ].join(" ")}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Adresse & Localisation ───────────────────────────────── */}
      <div className="rounded-xl border border-border bg-bg-base p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-text-primary">Adresse & Localisation</h3>
        <Input label="Adresse postale" value={values.address} onChange={set("address")} placeholder="Ex : Lot II J 117 Antananarivo" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Ville" value={values.city} onChange={set("city")} required />
          <Input label="Région" value={values.region} onChange={set("region")} required />
        </div>
      </div>

      {/* ── Profil professionnel ─────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-bg-base p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-text-primary">Profil professionnel</h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Profil <span className="text-error" aria-hidden>*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PROFILES.map(({ v, l }) => (
              <button key={v} type="button" onClick={() => onChange({ profile_type: v, profile_other: v !== "autre" ? "" : values.profile_other })}
                className={["rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  values.profile_type === v
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-border text-text-secondary hover:bg-bg-subtle",
                ].join(" ")}
              >{l}</button>
            ))}
          </div>
          {values.profile_type === "autre" && (
            <Input label="Précisez votre profil" value={values.profile_other} onChange={set("profile_other")} placeholder="Ex : Conseiller pédagogique" />
          )}
        </div>

        <Input label="Profession" value={values.profession} onChange={set("profession")} placeholder="Ex : Enseignant, Conseiller…" required />
        <Input label="Niveau d'étude / Diplôme (facultatif)" value={values.education_level} onChange={set("education_level")} placeholder="Ex : Licence, Master, Baccalauréat…" />
      </div>

      {/* ── Dates de formation COSP (COSP uniquement) ───────────── */}
      {isCosp && (
        <div className="rounded-xl border border-secondary-200 bg-secondary-50/30 p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-text-primary">Dates de formation COSP</h3>
          <p className="text-xs text-text-muted">Enregistrez toutes vos dates de formation COSP (une par ligne).</p>
          {values.cosp_training_dates.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                label={`Formation ${i + 1}`} type="date" value={d}
                onChange={(e) => {
                  const next = [...values.cosp_training_dates]
                  next[i] = e.target.value
                  onChange({ cosp_training_dates: next })
                }}
              />
              <button type="button" onClick={() => onChange({ cosp_training_dates: values.cosp_training_dates.filter((_, j) => j !== i) })}
                className="mt-6 text-xs text-error hover:underline shrink-0">Supprimer</button>
            </div>
          ))}
          <button type="button"
            onClick={() => onChange({ cosp_training_dates: [...values.cosp_training_dates, ""] })}
            className="self-start rounded-lg border border-dashed border-secondary-300 px-4 py-2 text-xs font-semibold text-secondary-600 hover:bg-secondary-50"
          >+ Ajouter une date</button>
        </div>
      )}
    </div>
  )
}
