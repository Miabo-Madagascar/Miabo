"use client"
/**
 * Auto-bilan élève — passe les 3 tests (VAK/RIASEC/DISC) puis soumet pour
 * validation à un conseiller CANOPE/COSP. Lecture seule si le bilan a été
 * administré par un conseiller (administered_by non null).
 */

import { AssessmentStatus } from "@/types"
import { useStudentBilan } from "@/hooks/useStudentBilan"
import { VakTest }    from "@/components/assessments/VakTest"
import { RiasecTest } from "@/components/assessments/RiasecTest"
import { DiscTest }   from "@/components/assessments/DiscTest"
import { BilanHeader }   from "@/components/canope/bilan/BilanHeader"
import { BilanTestCard } from "@/components/canope/bilan/BilanTestCard"
import { BilanAside }    from "@/components/canope/bilan/BilanAside"
import { TESTS_META }    from "@/components/canope/bilan/bilanMeta"
import { AssessmentResultsView } from "@/components/canope/AssessmentResultsView"
import { StudentBilanSynthesis } from "./StudentBilanSynthesis"

interface Props { assessmentId: string }

export function StudentBilanClient({ assessmentId }: Props) {
  const {
    assessment, isLoading, error, testType, viewType, submitting,
    setTestType, setViewType, closeTest, handleSave, handleCodeUpdate, handleSubmit,
  } = useStudentBilan(assessmentId)

  if (isLoading) return <div className="h-48 animate-pulse rounded-3xl bg-slate-100"/>
  if (error || !assessment) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error ?? "Bilan introuvable"}</p>
  )

  if (viewType) {
    return <AssessmentResultsView assessment={assessment} viewType={viewType}
      onCodeUpdate={handleCodeUpdate}
      onRetake={() => { setViewType(null); setTestType(viewType) }}
      onBack={closeTest} />
  }

  if (testType === "vak")    return <VakTest    onCancel={closeTest} onSave={handleSave("vak")}/>
  if (testType === "riasec") return <RiasecTest onCancel={closeTest} onSave={handleSave("riasec")} onCodeUpdate={handleCodeUpdate}/>
  if (testType === "disc")   return <DiscTest   onCancel={closeTest} onSave={handleSave("disc")}/>

  /* Lecture seule : bilan administré par un conseiller, ou déjà soumis/validé */
  const isLocked = assessment.administered_by !== null
    || assessment.status === AssessmentStatus.PendingValidation
    || assessment.status === AssessmentStatus.Validated

  const dominants = {
    vak:    assessment.vak_dominant,
    riasec: assessment.riasec_code,
    disc:   assessment.disc_dominant,
  }
  const completedCount = Object.values(dominants).filter(Boolean).length
  const allCompleted   = completedCount === 3

  return (
    <div className="w-full py-4">
      <BilanHeader assessment={assessment} completedCount={completedCount} total={3}/>

      <section className="mt-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-tight text-slate-900">
              Mes tests d&apos;orientation
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Chaque test explore une facette différente de ton profil.
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
        <StudentBilanSynthesis
          status={assessment.status as AssessmentStatus}
          canSubmit={allCompleted && assessment.status === AssessmentStatus.InProgress}
          submitting={submitting}
          actorComment={assessment.actor_comment}
          validatedAt={assessment.validated_at}
          onSubmit={handleSubmit}/>
        <BilanAside assessment={assessment}/>
      </section>
    </div>
  )
}
