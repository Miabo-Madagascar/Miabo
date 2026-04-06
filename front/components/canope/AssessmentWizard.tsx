"use client"
/**
 * AssessmentWizard — création d'un bilan en 2 étapes.
 * Étape 1 : choix Option A (élève MIABO) ou Option B (jeune externe)
 * Étape 2 : identifiant de l'élève ou infos du jeune externe
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

type Option = "A" | "B"

export function AssessmentWizard({ locale, basePath }: AssessmentWizardProps) {
  const router = useRouter()

  const [option,    setOption]    = useState<Option>("A")
  const [studentId, setStudentId] = useState("")
  const [serie,     setSerie]     = useState<"L" | "S" | "">("")
  const [interest,  setInterest]  = useState("")
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleSubmit() {
    if (option === "A" && !studentId.trim()) {
      setError("Veuillez renseigner l'identifiant de l'élève.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, string | null> = {
        serie:          serie || null,
        career_interest: interest || null,
      }
      if (option === "A") body.student_profile_id = studentId.trim()
      else                body.external_young_id  = "pending"   // sera créé côté COSP

      const assessment = await api.post<{ id: string }>("/assessments/", body)
      router.push(`/${locale}/${basePath}/bilans/${assessment.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Choix option ────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Type de bilan</p>
        <div className="flex gap-3">
          {(["A", "B"] as Option[]).map((o) => (
            <button key={o} type="button" onClick={() => setOption(o)}
              className={["flex-1 rounded-xl border p-4 text-left transition-colors",
                option === o
                  ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                  : "border-[var(--border-default)] hover:bg-[var(--bg-subtle)]",
              ].join(" ")}
            >
              <p className="font-semibold text-[var(--text-primary)]">Option {o}</p>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {o === "A" ? "Élève inscrit sur MIABO" : "Jeune externe (sans compte)"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Identifiant élève (Option A) ─────────────────────────── */}
      {option === "A" && (
        <Input
          label="Identifiant de l'élève (UUID MIABO)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />
      )}

      {/* ── Champs communs ───────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">Série (optionnel)</label>
          <div className="flex gap-2">
            {(["", "L", "S"] as const).map((s) => (
              <button key={s || "none"} type="button" onClick={() => setSerie(s)}
                className={["flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                  serie === s
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                ].join(" ")}
              >
                {s || "—"}
              </button>
            ))}
          </div>
        </div>
        <Input label="Carrière envisagée (optionnel)" value={interest}
          onChange={(e) => setInterest(e.target.value)} placeholder="Médecine, Ingénierie…" />
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">{error}</p>}

      <Button onClick={handleSubmit} isLoading={loading} className="self-start">
        Créer le bilan et démarrer les tests
      </Button>
    </div>
  )
}
