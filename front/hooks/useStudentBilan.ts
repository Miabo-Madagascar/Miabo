"use client"
/**
 * Hook — charge et pilote un auto-bilan élève (VAK/RIASEC/DISC) via /self-assessments.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import type { Assessment } from "@/types"
import type { ResultViewType } from "@/components/canope/AssessmentResultsView"

type TestKey = "vak" | "riasec" | "disc"

export function useStudentBilan(assessmentId: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [testType,   setTestType]   = useState<TestKey | null>(null)
  const [viewType,   setViewType]   = useState<ResultViewType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setIsLoading(true)
    api.get<Assessment>(`/self-assessments/${assessmentId}`)
      .then(setAssessment)
      .catch(e => setError(e instanceof ApiError ? e.detail : "Bilan introuvable"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [assessmentId])

  const closeTest = () => { setTestType(null); setViewType(null); load() }

  const handleSave = (key: TestKey) => async (scores: Record<string, number>) => {
    try {
      if (key === "vak") {
        await api.put(`/self-assessments/${assessmentId}/vak`, {
          v_score: scores["V"] ?? 0, a_score: scores["A"] ?? 0, k_score: scores["K"] ?? 0,
        })
      } else {
        await api.put(`/self-assessments/${assessmentId}/${key}`, scores)
      }
    } catch (err) { alert(err instanceof ApiError ? err.detail : "Erreur lors de la sauvegarde") }
  }

  const handleCodeUpdate = async (code: string) => {
    try {
      await api.put(`/self-assessments/${assessmentId}/riasec-code`, { code })
      load()
    } catch (err) { alert(err instanceof ApiError ? err.detail : "Erreur lors de la sauvegarde du code") }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.put(`/self-assessments/${assessmentId}/submit`)
      load()
    } catch (err) { alert(err instanceof ApiError ? err.detail : "Erreur lors de la soumission") }
    finally { setSubmitting(false) }
  }

  return {
    assessment, isLoading, error, testType, viewType, submitting,
    setTestType, setViewType, closeTest, handleSave, handleCodeUpdate, handleSubmit,
  }
}
