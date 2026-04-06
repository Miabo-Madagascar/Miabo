"use client"
/**
 * ProfileEditForm — formulaire d'édition de profil.
 * Champs communs à tous les rôles + section tuteur si rôle = tutor.
 */

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { TutorProfileSection, type TutorFields } from "./TutorProfileSection"
import type { FullProfile } from "@/types"
import { GradeLevel, UserRole } from "@/types"

interface CommonForm {
  full_name: string
  phone:     string
  locale:    "fr" | "mg"
}

const EMPTY_TUTOR: TutorFields = {
  bio: "", subjects: "", hourly_rate: "", location: "",
  teaching_methods: "", grade_levels: [],
}

function toTutorFields(tp: FullProfile["tutor_profile"]): TutorFields {
  if (!tp) return EMPTY_TUTOR
  return {
    bio:              tp.bio              ?? "",
    subjects:         tp.subjects.join(", "),
    hourly_rate:      String(tp.hourly_rate),
    location:         tp.location         ?? "",
    teaching_methods: tp.teaching_methods.join(", "),
    grade_levels:     tp.grade_levels     as GradeLevel[],
  }
}

function splitCsv(s: string): string[] {
  return s.split(",").map((v) => v.trim()).filter(Boolean)
}

export function ProfileEditForm() {
  const [common,   setCommon]   = useState<CommonForm>({ full_name: "", phone: "", locale: "fr" })
  const [tutor,    setTutor]    = useState<TutorFields>(EMPTY_TUTOR)
  const [isTutor,  setIsTutor]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api.get<FullProfile>("/profiles/me")
      setCommon({ full_name: data.full_name, phone: data.phone ?? "", locale: data.preferred_language })
      setIsTutor(data.role === UserRole.Tutor)
      if (data.role === UserRole.Tutor) setTutor(toTutorFields(data.tutor_profile))
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.put("/profiles/me", {
        full_name:  common.full_name  || null,
        phone:      common.phone      || null,
        locale:     common.locale,
      })
      if (isTutor) {
        await api.put("/profiles/me/tutor", {
          bio:              tutor.bio              || null,
          subjects:         splitCsv(tutor.subjects),
          grade_levels:     tutor.grade_levels,
          hourly_rate:      tutor.hourly_rate ? parseInt(tutor.hourly_rate, 10) : null,
          teaching_methods: splitCsv(tutor.teaching_methods),
          location:         tutor.location         || null,
        })
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-[var(--bg-muted)]" />

  return (
    <div className="flex flex-col gap-6">
      {/* ── Champs communs ──────────────────────────────────────── */}
      <div className="rounded-xl bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)] flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)]">Informations générales</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nom complet" value={common.full_name}
            onChange={(e) => setCommon((p) => ({ ...p, full_name: e.target.value }))} />
          <Input label="Téléphone (+261…)" value={common.phone}
            onChange={(e) => setCommon((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+261340000000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Langue</label>
          <div className="flex gap-3">
            {(["fr", "mg"] as const).map((l) => (
              <button key={l} type="button"
                onClick={() => setCommon((p) => ({ ...p, locale: l }))}
                className={["rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  common.locale === l
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                ].join(" ")}
              >{l === "fr" ? "Français" : "Malagasy"}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section tuteur ──────────────────────────────────────── */}
      {isTutor && (
        <TutorProfileSection values={tutor}
          onChange={(next) => setTutor((p) => ({ ...p, ...next }))} />
      )}

      {/* ── Feedback & submit ───────────────────────────────────── */}
      {error   && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">{error}</p>}
      {success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-[var(--color-success)]">Profil mis à jour avec succès.</p>}
      <Button onClick={handleSubmit} isLoading={saving} className="self-start">
        Enregistrer les modifications
      </Button>
    </div>
  )
}
