"use client"
/**
 * ProfileEditForm — formulaire d'édition de profil, tous rôles.
 * Champs communs + section tuteur (role=tutor) + section CANOPE/COSP.
 */

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { TutorProfileSection, type TutorFields } from "./TutorProfileSection"
import { CanopProfileSection, type CanopFields } from "@/components/canope/CanopProfileSection"
import type { FullProfile } from "@/types"
import { GradeLevel, UserRole } from "@/types"

interface CommonForm { full_name: string; phone: string; locale: "fr" | "mg" }

const EMPTY_TUTOR: TutorFields = {
  bio: "", subjects: "", hourly_rate: "", location: "",
  teaching_methods: "", grade_levels: [],
}

const EMPTY_CANOP: CanopFields = {
  first_name: "", last_name: "", date_of_birth: "", gender: "",
  address: "", city: "", region: "", profession: "",
  profile_type: "", profile_other: "", education_level: "",
  cosp_training_dates: [],
}

function toTutorFields(tp: FullProfile["tutor_profile"]): TutorFields {
  if (!tp) return EMPTY_TUTOR
  return {
    bio: tp.bio ?? "", subjects: tp.subjects.join(", "),
    hourly_rate: String(tp.hourly_rate), location: tp.location ?? "",
    teaching_methods: tp.teaching_methods.join(", "),
    grade_levels: tp.grade_levels as GradeLevel[],
  }
}

function toCanopFields(cp: FullProfile["canop_profile"]): CanopFields {
  if (!cp) return EMPTY_CANOP
  return {
    first_name:          cp.first_name,
    last_name:           cp.last_name,
    date_of_birth:       cp.date_of_birth,
    gender:              cp.gender,
    address:             cp.address             ?? "",
    city:                cp.city,
    region:              cp.region,
    profession:          cp.profession,
    profile_type:        cp.profile_type        ?? "",
    profile_other:       cp.profile_other       ?? "",
    education_level:     cp.education_level     ?? "",
    cosp_training_dates: cp.cosp_training_dates ?? [],
  }
}

function splitCsv(s: string): string[] {
  return s.split(",").map(v => v.trim()).filter(Boolean)
}

export function ProfileEditForm() {
  const [common,  setCommon]  = useState<CommonForm>({ full_name: "", phone: "", locale: "fr" })
  const [tutor,   setTutor]   = useState<TutorFields>(EMPTY_TUTOR)
  const [canop,   setCanop]   = useState<CanopFields>(EMPTY_CANOP)
  const [sesame,  setSesame]  = useState("")
  const [role,    setRole]    = useState("")
  const [isCosp,  setIsCosp]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api.get<FullProfile>("/profiles/me")
      setCommon({ full_name: data.full_name, phone: data.phone ?? "", locale: data.preferred_language })
      setRole(data.role)
      if (data.role === UserRole.Tutor) setTutor(toTutorFields(data.tutor_profile))
      if (data.role === UserRole.Canope || data.role === UserRole.Cosp) {
        setCanop(toCanopFields(data.canop_profile))
        setSesame(data.canop_profile?.sesame_code ?? "")
        setIsCosp(data.canop_profile?.is_cosp ?? false)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit() {
    setSaving(true); setError(null); setSuccess(false)
    try {
      await api.put("/profiles/me", { full_name: common.full_name || null, phone: common.phone || null, locale: common.locale })

      if (role === UserRole.Tutor) {
        await api.put("/profiles/me/tutor", {
          bio: tutor.bio || null,
          subjects: splitCsv(tutor.subjects),
          grade_levels: tutor.grade_levels,
          hourly_rate: tutor.hourly_rate ? parseInt(tutor.hourly_rate, 10) : null,
          teaching_methods: splitCsv(tutor.teaching_methods),
          location: tutor.location || null,
        })
      }

      if (role === UserRole.Canope || role === UserRole.Cosp) {
        await api.put("/profiles/me/canope", {
          first_name:          canop.first_name          || null,
          last_name:           canop.last_name           || null,
          date_of_birth:       canop.date_of_birth       || null,
          gender:              canop.gender              || null,
          address:             canop.address             || null,
          city:                canop.city                || null,
          region:              canop.region              || null,
          profession:          canop.profession          || null,
          profile_type:        canop.profile_type        || null,
          profile_other:       canop.profile_other       || null,
          education_level:     canop.education_level     || null,
          cosp_training_dates: isCosp ? canop.cosp_training_dates.filter(Boolean) : undefined,
        })
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-bg-muted" />

  return (
    <div className="flex flex-col gap-6">
      {/* ── Champs communs ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-bg-base p-5 flex flex-col gap-4">
        <h3 className="font-semibold text-text-primary">Informations générales</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nom complet" value={common.full_name} required
            onChange={e => setCommon(p => ({ ...p, full_name: e.target.value }))} />
          <Input label="Téléphone (+261…)" value={common.phone} required
            onChange={e => setCommon(p => ({ ...p, phone: e.target.value }))} placeholder="+261340000000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Langue</label>
          <div className="flex gap-3">
            {(["fr", "mg"] as const).map(l => (
              <button key={l} type="button" onClick={() => setCommon(p => ({ ...p, locale: l }))}
                className={["rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  common.locale === l
                    ? "border-primary bg-primary-50 text-primary-700"
                    : "border-border text-text-secondary hover:bg-bg-subtle",
                ].join(" ")}
              >{l === "fr" ? "Français" : "Malagasy"}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section tuteur ──────────────────────────────────────── */}
      {role === UserRole.Tutor && (
        <TutorProfileSection values={tutor} onChange={next => setTutor(p => ({ ...p, ...next }))} />
      )}

      {/* ── Section CANOPE / COSP ────────────────────────────────── */}
      {(role === UserRole.Canope || role === UserRole.Cosp) && (
        <CanopProfileSection
          values={canop} isCosp={isCosp} sesame={sesame}
          onChange={next => setCanop(p => ({ ...p, ...next }))}
        />
      )}

      {error   && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p>}
      {success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-success">Profil mis à jour avec succès.</p>}
      <Button onClick={handleSubmit} isLoading={saving} className="self-start">
        Enregistrer les modifications
      </Button>
    </div>
  )
}
