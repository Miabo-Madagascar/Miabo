"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api, ApiError } from "@/lib/api/client"
import type { Assessment } from "@/types"
import { AssessmentStatus } from "@/types"
import { VakTest }    from "../assessments/VakTest"
import { RiasecTest } from "../assessments/RiasecTest"
import { DiscTest }   from "../assessments/DiscTest"
import { BilanHeader }     from "./bilan/BilanHeader"
import { BilanTestCard }   from "./bilan/BilanTestCard"
import { BilanAside }      from "./bilan/BilanAside"
import { BilanSynthesis }  from "./bilan/BilanSynthesis"
import { TESTS_META }      from "./bilan/bilanMeta"
import { AssessmentResultsView } from "./AssessmentResultsView"
import type { ResultViewType }   from "./AssessmentResultsView"

interface Props { assessmentId: string; locale: string; basePath: string }

export function AssessmentDetailClient({ assessmentId, locale }: Props) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [testType,   setTestType]   = useState<"vak" | "riasec" | "disc" | null>(null)
  const [viewType,   setViewType]   = useState<ResultViewType | null>(null)
  const [comment,    setComment]    = useState("")
  const [validating, setValidating] = useState(false)

  const load = () => {
    setIsLoading(true)
    api.get<Assessment>(`/assessments/${assessmentId}`)
      .then(d  => { setAssessment(d); setComment(d.actor_comment || "") })
      .catch(e => setError(e instanceof ApiError ? e.detail : "Bilan introuvable"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [assessmentId])

  /* Ferme le test, rafraîchit l'assessment (appelé par onCancel ou onBack depuis résultats) */
  const closeTest = () => { setTestType(null); setViewType(null); load() }

  /* Sauvegarde les scores — ne ferme PAS le test (VakTest affichera ses résultats) */
  const handleSave = (key: "vak" | "riasec" | "disc") => async (scores: Record<string, number>) => {
    try {
      if (key === "vak") {
        await api.put(`/assessments/${assessmentId}/vak`, {
          v_score: scores["V"] ?? 0, a_score: scores["A"] ?? 0, k_score: scores["K"] ?? 0,
        })
      } else {
        await api.put(`/assessments/${assessmentId}/${key}`, scores)
      }
    } catch (err: any) { alert(err.detail || "Erreur lors de la sauvegarde") }
  }

  /* Sauvegarde le code RIASEC choisi manuellement après résolution d'ex-aequo */
  const handleCodeUpdate = async (code: string) => {
    try {
      await api.put(`/assessments/${assessmentId}/riasec-code`, { code })
      load()
    } catch (err: any) { alert(err.detail || "Erreur lors de la sauvegarde du code") }
  }

  const handleValidate = async () => {
    setValidating(true)
    try {
      await api.put(`/assessments/${assessmentId}/validate`, { actor_comment: comment })
      load()
    } catch (err: any) { alert(err.detail || "Erreur lors de la validation") }
    finally { setValidating(false) }
  }

  if (isLoading) return <div className="h-48 animate-pulse rounded-3xl bg-slate-100"/>
  if (error || !assessment) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error ?? "Bilan introuvable"}</p>
  )

  /* Affichage des résultats depuis les scores sauvegardés */
  if (viewType) {
    return <AssessmentResultsView assessment={assessment} viewType={viewType}
      onCodeUpdate={handleCodeUpdate}
      onRetake={() => { setViewType(null); setTestType(viewType) }}
      onBack={closeTest} />
  }

  /* Passage des tests */
  if (testType === "vak")    return <VakTest    onCancel={closeTest} onSave={handleSave("vak")}/>
  if (testType === "riasec") return <RiasecTest onCancel={closeTest} onSave={handleSave("riasec")} onCodeUpdate={handleCodeUpdate}/>
  if (testType === "disc")   return <DiscTest   onCancel={closeTest} onSave={handleSave("disc")}/>

  const isLocked = assessment.status === AssessmentStatus.Validated

  /* Utilise le code sauvegardé (ordre choisi par l'user) ;
     recalcule depuis les scores uniquement si le code est absent ou encore à 2 lettres (données pré-migration) */
  const riasecCode = (assessment.riasec_code && assessment.riasec_code.length >= 3)
    ? assessment.riasec_code
    : assessment.riasec_scores
      ? Object.entries(assessment.riasec_scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([k]) => k)
          .join("")
      : assessment.riasec_code

  const dominants = { vak: assessment.vak_dominant, riasec: riasecCode, disc: assessment.disc_dominant }
  const completedCount = Object.values(dominants).filter(Boolean).length
  const allCompleted   = completedCount === 3

  return (
    <div className="w-full py-4">
      <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mb-6">
        <Link href={`/${locale}/canope/bilans`} className="hover:text-slate-900 transition-colors">
          Bilans d&apos;orientation
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold">
          {assessment.external_young_full_name ?? "Bilan"}
        </span>
      </nav>

      <BilanHeader assessment={assessment} completedCount={completedCount} total={3}/>

      <section className="mt-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-tight text-slate-900">
              Modules d&apos;évaluation
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Chaque test explore une facette différente du profil de l&apos;élève.
            </p>
          </div>
          <span className="hidden sm:block text-[11px] font-semibold text-slate-500">
            {completedCount} / 3 terminés
          </span>
        </div>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          {(["vak", "riasec", "disc"] as const).map(key => (
            <BilanTestCard key={key} test={TESTS_META[key]}
              dominant={dominants[key]} locked={isLocked}
              onStart={() => setTestType(key)}
              onView={dominants[key] ? () => setViewType(key) : undefined}/>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 grid-cols-1 lg:grid-cols-[1fr_300px]">
        <BilanSynthesis
          locked={isLocked} canValidate={allCompleted} validating={validating}
          comment={comment} actorComment={assessment.actor_comment}
          validatedAt={assessment.validated_at} assessmentId={assessmentId}
          onCommentChange={setComment} onValidate={handleValidate}/>
        <BilanAside assessment={assessment}/>
      </section>
    </div>
  )
}
