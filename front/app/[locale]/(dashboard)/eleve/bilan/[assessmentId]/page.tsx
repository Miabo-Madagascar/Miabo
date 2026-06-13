"use client"
/**
 * Page détail de l'auto-bilan — élève.
 */

import { use } from "react"
import { StudentBilanClient } from "@/components/eleve/bilan/StudentBilanClient"

interface Props { params: Promise<{ locale: string; assessmentId: string }> }

export default function EleveBilanDetailPage({ params }: Props) {
  const { assessmentId } = use(params)
  return <StudentBilanClient assessmentId={assessmentId} />
}
