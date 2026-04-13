"use client"
/**
 * Page détail bilan — CANOPE.
 * Affiche le récapitulatif et permet de lancer les tests VAK, RIASEC, DISC.
 */

import { use } from "react"
import { AssessmentDetailClient } from "@/components/canope/AssessmentDetailClient"

interface Props { params: Promise<{ locale: string; assessmentId: string }> }

export default function CanopeAssessmentDetailPage({ params }: Props) {
  const { locale, assessmentId } = use(params)
  return <div className="flex items-center justify-center w-full">
    <AssessmentDetailClient assessmentId={assessmentId} locale={locale} basePath="canope" />
  </div>
}
