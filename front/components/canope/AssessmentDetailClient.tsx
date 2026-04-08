"use client"
/**
 * AssessmentDetailClient — affiche le statut d'un bilan et les boutons pour les tests.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import type { Assessment } from "@/types"
import { AssessmentStatus } from "@/types"
import { VakTest } from "../assessments/VakTest"
import { RiasecTest } from "../assessments/RiasecTest"
import { DiscTest } from "../assessments/DiscTest"

interface AssessmentDetailClientProps {
  assessmentId: string
  locale:       string
  basePath:     string
}

export function AssessmentDetailClient({ assessmentId, locale, basePath }: AssessmentDetailClientProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [testType,   setTestType]   = useState<"vak" | "riasec" | "disc" | null>(null)
  const [comment,    setComment]    = useState("")
  const [validating, setValidating] = useState(false)

  const load = () => {
    setIsLoading(true)
    api.get<Assessment>(`/assessments/${assessmentId}`)
      .then((data) => {
        setAssessment(data)
        setComment(data.actor_comment || "")
      })
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Bilan introuvable"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [assessmentId])

  const handleSaveVak = async (scores: { v: number, a: number, k: number }) => {
    try {
      await api.put(`/assessments/${assessmentId}/vak`, {
        v_score: scores.v,
        a_score: scores.a,
        k_score: scores.k,
      })
      setTestType(null)
      load()
    } catch (err: any) {
      alert(err.detail || "Erreur lors de la sauvegarde")
    }
  }

  const handleSaveRiasec = async (scores: Record<string, number>) => {
    try {
      await api.put(`/assessments/${assessmentId}/riasec`, scores)
      setTestType(null)
      load()
    } catch (err: any) {
      alert(err.detail || "Erreur lors de la sauvegarde")
    }
  }

  const handleSaveDisc = async (scores: Record<string, number>) => {
    try {
      await api.put(`/assessments/${assessmentId}/disc`, scores)
      setTestType(null)
      load()
    } catch (err: any) {
      alert(err.detail || "Erreur lors de la sauvegarde")
    }
  }

  const handleValidate = async () => {
    setValidating(true)
    try {
      await api.put(`/assessments/${assessmentId}/validate`, {
        actor_comment: comment
      })
      load()
    } catch (err: any) {
      alert(err.detail || "Erreur lors de la validation")
    } finally {
      setValidating(false)
    }
  }

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-bg-muted" />

  if (error || !assessment) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-error">{error ?? "Bilan introuvable"}</p>
  )

  if (testType === "vak") return <VakTest onCancel={() => setTestType(null)} onSave={handleSaveVak} />
  if (testType === "riasec") return <RiasecTest onCancel={() => setTestType(null)} onSave={handleSaveRiasec} />
  if (testType === "disc") return <DiscTest onCancel={() => setTestType(null)} onSave={handleSaveDisc} />

  const isLocked = assessment.status === AssessmentStatus.Validated

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            Bilan : {assessment.student_profile_id ? "Élève MIABO" : "Jeune externe"}
          </h1>
          <p className="text-sm text-text-secondary">Statut : {assessment.status}</p>
        </div>
        {isLocked && <Badge variant="success">Bilan Validé</Badge>}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* VAK */}
        <TestCard
          title="Test VAK"
          desc="Styles d'apprentissage"
          dominant={assessment.vak_dominant}
          completed={!!assessment.vak_dominant}
          onClick={() => setTestType("vak")}
          disabled={isLocked}
        />
        {/* RIASEC */}
        <TestCard
          title="Test RIASEC"
          desc="Intérêts professionnels"
          dominant={assessment.riasec_code}
          completed={!!assessment.riasec_code}
          onClick={() => setTestType("riasec")}
          disabled={isLocked}
        />
        {/* DISC */}
        <TestCard
          title="Test DISC"
          desc="Profil comportemental"
          dominant={assessment.disc_dominant}
          completed={!!assessment.disc_dominant}
          onClick={() => setTestType("disc")}
          disabled={isLocked}
        />
      </div>

      {!isLocked && (
        <div className="rounded-xl border border-border p-5 bg-bg-subtle">
           <h3 className="font-semibold text-text-primary mb-2">Commentaire final</h3>
           <textarea 
             className="w-full rounded-lg border border-border bg-bg-base p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
             placeholder="Ajoutez vos observations de professionnel..."
             rows={4}
             value={comment}
             onChange={(e) => setComment(e.target.value)}
           />
           <Button 
            className="mt-4" 
            isLoading={validating}
            onClick={handleValidate}
            disabled={!assessment.vak_dominant || !assessment.riasec_code || !assessment.disc_dominant}
           >
             Valider le bilan
           </Button>
        </div>
      )}

      {isLocked && assessment.actor_comment && (
        <div className="rounded-xl border border-border p-5 bg-bg-base">
           <h3 className="font-semibold text-text-primary mb-2">Observations</h3>
           <p className="text-sm text-text-secondary italic">"{assessment.actor_comment}"</p>
        </div>
      )}
    </div>
  )
}

function TestCard({ title, desc, dominant, completed, onClick, disabled }: any) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-5 transition-all ${
      completed ? "border-green-200 bg-green-50" : "border-border bg-bg-base"
    }`}>
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary leading-tight mt-1">{desc}</p>
      </div>
      {dominant && (
        <p className="text-lg font-bold text-green-700">Code : {dominant}</p>
      )}
      <Button 
        variant={completed ? "outline" : "primary"} 
        size="sm" 
        onClick={onClick}
        disabled={disabled}
      >
        {completed ? "Recalculer" : "Démarrer"}
      </Button>
    </div>
  )
}
