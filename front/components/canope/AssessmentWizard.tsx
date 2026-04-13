"use client"
/**
 * AssessmentWizard — création d'un bilan pour un jeune externe (sans compte MIABO).
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface AssessmentWizardProps {
  locale:   string
  basePath: string   // "canope" | "cosp"
}

// Séries disponibles au lycée malgache
const SERIES = ["A1", "A2", "S", "OSE", "C", "D", "L"] as const
type Serie = typeof SERIES[number] | ""

export function AssessmentWizard({ locale, basePath }: AssessmentWizardProps) {
  const router = useRouter()

  const [externalName, setExternalName] = useState("")
  const [serie,        setSerie]        = useState<Serie>("")
  const [interest,     setInterest]     = useState("")
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  async function handleSubmit() {
    if (!externalName.trim()) {
      setError("Veuillez renseigner le nom complet du jeune.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const assessment = await api.post<{ id: string }>("/assessments/", {
        external_young_full_name: externalName.trim(),
        serie:                    serie || null,
        career_interest:          interest.trim() || null,
      })
      router.push(`/${locale}/${basePath}/bilans/${assessment.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Nom du jeune ────────────────────────────────────────── */}
      <Input
        label="Nom complet du jeune"
        value={externalName}
        onChange={(e) => setExternalName(e.target.value)}
        placeholder="Ex : Jean Rakoto"
      />

      {/* ── Série ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">
          Série (optionnel)
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Bouton "Aucune" */}
          <button
            type="button"
            onClick={() => setSerie("")}
            className={[
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              serie === ""
                ? "border-primary bg-primary-50 text-primary-700"
                : "border-border text-text-secondary hover:bg-bg-subtle",
            ].join(" ")}
          >
            —
          </button>

          {SERIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSerie(s)}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                serie === s
                  ? "border-primary bg-primary-50 text-primary-700"
                  : "border-border text-text-secondary hover:bg-bg-subtle",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Carrière envisagée ───────────────────────────────────── */}
      <Input
        label="Carrière envisagée (optionnel)"
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        placeholder="Médecine, Ingénierie…"
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p>
      )}

      <Button onClick={handleSubmit} isLoading={loading} className="self-start">
        Créer le bilan et démarrer les tests
      </Button>
    </div>
  )
}
