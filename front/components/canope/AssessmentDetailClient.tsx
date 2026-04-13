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
    <div className="flex w-full flex-col gap-8 pb-10">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-6 border ${
        isLocked ? "bg-success/5 border-success/20" : "bg-primary-50 border-primary-100"
      }`}>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            {assessment.external_young_full_name
              ?? (assessment.student_profile_id ? "Élève MIABO" : "Jeune externe")}
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`flex h-2.5 w-2.5 rounded-full ${
              isLocked ? "bg-success" : "bg-primary animate-pulse"
            }`} />
            <span className={isLocked ? "text-success" : "text-primary"}>
              {isLocked ? "Bilan validé et verrouillé" : "En cours de réalisation"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tests Grid ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">Modules d&apos;évaluation</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <TestCard
            title="Test VAK"
            desc="Styles d'apprentissage"
            dominant={assessment.vak_dominant}
            completed={!!assessment.vak_dominant}
            onClick={() => setTestType("vak")}
            disabled={isLocked}
          />
          <TestCard
            title="Test RIASEC"
            desc="Intérêts professionnels"
            dominant={assessment.riasec_code}
            completed={!!assessment.riasec_code}
            onClick={() => setTestType("riasec")}
            disabled={isLocked}
          />
          <TestCard
            title="Test DISC"
            desc="Profil comportemental"
            dominant={assessment.disc_dominant}
            completed={!!assessment.disc_dominant}
            onClick={() => setTestType("disc")}
            disabled={isLocked}
          />
        </div>
      </div>

      {/* ── Commentaire / Synthèse ───────────────────────────── */}
      {!isLocked && (
        <div className="rounded-2xl border border-border bg-bg-base p-6 shadow-sm overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
           <h3 className="text-lg font-bold text-text-primary mb-2">Synthèse du professionnel</h3>
           <p className="text-sm text-text-secondary mb-4">
             Ajoutez vos observations finales. Ce commentaire apparaîtra sur le rapport de l&apos;élève.
           </p>
           
           <textarea 
             className="w-full rounded-xl border border-border bg-bg-subtle p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted min-h-[120px]"
             placeholder="Rédigez votre synthèse ici..."
             value={comment}
             onChange={(e) => setComment(e.target.value)}
           />
           
           <div className="mt-5 flex justify-end">
            <Button 
              size="lg"
              isLoading={validating}
              onClick={handleValidate}
              disabled={!assessment.vak_dominant || !assessment.riasec_code || !assessment.disc_dominant}
              className={`rounded-full px-8 shadow-lg ${
                (!assessment.vak_dominant || !assessment.riasec_code || !assessment.disc_dominant) 
                  ? "opacity-50 grayscale" 
                  : "bg-primary hover:bg-primary-600 shadow-primary/30"
              }`}
            >
              Clôturer et valider le bilan
            </Button>
           </div>
        </div>
      )}

      {isLocked && assessment.actor_comment && (
        <div className="rounded-2xl border border-success/20 bg-success/5 p-6 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-success" />
           <h3 className="text-lg font-bold text-text-primary mb-3">Vos observations</h3>
           <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
             {assessment.actor_comment}
           </p>
        </div>
      )}
    </div>
  )
}

function TestCard({ title, desc, dominant, completed, onClick, disabled }: any) {
  return (
    <div className={`group relative flex flex-col justify-between gap-4 rounded-2xl border p-6 transition-all duration-300 ${
      completed 
        ? "border-success/30 bg-success/5 shadow-sm" 
        : "border-border bg-bg-base hover:border-primary-300 hover:shadow-md"
    }`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-text-primary">{title}</h3>
          {completed && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary leading-tight">{desc}</p>
      </div>

      {dominant && (
        <div className="my-2 rounded-lg bg-white/50 px-3 py-2 text-center border border-success/10">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Résultat</p>
          <p className="text-2xl font-black text-success drop-shadow-sm">{dominant}</p>
        </div>
      )}

      <Button 
        variant={completed ? "outline" : "primary"} 
        size="sm" 
        onClick={onClick}
        disabled={disabled}
        className={completed ? "w-full border-success/30 text-success hover:bg-success/10" : "w-full shadow-sm"}
      >
        {completed ? "Refaire le test" : "Démarrer"}
      </Button>
    </div>
  )
}
