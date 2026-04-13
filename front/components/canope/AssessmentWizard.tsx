"use client"
/**
 * AssessmentWizard — création d'un bilan pour un jeune externe (CDC §6).
 * Collecte profil complet du jeune, série et carrière avant de lancer les tests.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ExternalYoungForm, type ExternalYoungFields } from "./ExternalYoungForm"

interface Props {
  locale:   string
  basePath: string   // "canope" | "cosp"
}

const SERIES = ["A1", "A2", "S", "OSE", "C", "D", "L"] as const
type Serie = typeof SERIES[number] | ""

const EMPTY_YOUNG: ExternalYoungFields = {
  full_name: "", date_of_birth: "", gender: "",
  region: "", quartier: "", school_name: "",
}

export function AssessmentWizard({ locale, basePath }: Props) {
  const router = useRouter()
  const [young,    setYoung]    = useState<ExternalYoungFields>(EMPTY_YOUNG)
  const [serie,    setSerie]    = useState<Serie>("")
  const [interest, setInterest] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit() {
    if (!young.full_name.trim()) { setError("Veuillez renseigner le nom complet."); return }
    if (!young.date_of_birth)    { setError("Veuillez renseigner la date de naissance."); return }
    if (!young.gender)           { setError("Veuillez sélectionner le sexe."); return }
    if (!young.region.trim())    { setError("Veuillez renseigner la région."); return }
    setLoading(true); setError(null)
    try {
      const data = await api.post<{ id: string }>("/assessments/", {
        external_young_full_name: young.full_name.trim(),
        date_of_birth:            young.date_of_birth,
        gender:                   young.gender,
        region:                   young.region.trim(),
        quartier:                 young.quartier.trim() || null,
        school_name:              young.school_name.trim() || null,
        serie:                    serie || null,
        career_interest:          interest.trim() || null,
      })
      router.push(`/${locale}/${basePath}/bilans/${data.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Profil du jeune ────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-bg-base p-5">
        <h3 className="mb-4 text-sm font-bold text-text-primary">Informations du jeune</h3>
        <ExternalYoungForm values={young} onChange={p => setYoung(prev => ({ ...prev, ...p }))} />
      </div>

      {/* ── Série ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">Série (optionnel)</label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setSerie("")}
            className={["rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              serie === "" ? "border-primary bg-primary-50 text-primary-700" : "border-border text-text-secondary hover:bg-bg-subtle",
            ].join(" ")}>—</button>
          {SERIES.map(s => (
            <button key={s} type="button" onClick={() => setSerie(s)}
              className={["rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                serie === s ? "border-primary bg-primary-50 text-primary-700" : "border-border text-text-secondary hover:bg-bg-subtle",
              ].join(" ")}>{s}</button>
          ))}
        </div>
      </div>

      {/* ── Carrière envisagée ─────────────────────────────────── */}
      <Input label="Carrière envisagée (optionnel)" value={interest}
        onChange={(e) => setInterest(e.target.value)} placeholder="Ex : Médecine, Ingénierie…" />

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p>}

      <Button onClick={handleSubmit} isLoading={loading} className="self-start">
        Créer le bilan et démarrer les tests
      </Button>
    </div>
  )
}
