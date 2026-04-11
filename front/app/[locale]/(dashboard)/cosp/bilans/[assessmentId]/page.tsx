"use client"
/**
 * Page détail bilan — COSP.
 * Affiche le récapitulatif et permet de lancer les tests VAK, RIASEC, DISC.
 */

import { use } from "react"
import { AssessmentDetailClient } from "@/components/canope/AssessmentDetailClient"

interface Props { params: Promise<{ locale: string; assessmentId: string }> }

export default function CospAssessmentDetailPage({ params }: Props) {
  const { locale, assessmentId } = use(params)
  return <AssessmentDetailClient assessmentId={assessmentId} locale={locale} basePath="cosp" />
}
