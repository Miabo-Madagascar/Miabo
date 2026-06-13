"use client"
/**
 * Page bilan d'orientation — élève.
 * Sans auto-bilan : écran d'accueil. Sinon : redirige vers le plus récent.
 */

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api/client"
import type { Assessment } from "@/types"
import { StudentBilanIntro } from "@/components/eleve/bilan/StudentBilanIntro"

interface Props { params: Promise<{ locale: string }> }

export default function EleveBilanPage({ params }: Props) {
  const { locale } = use(params)
  const router = useRouter()
  const [rows,    setRows]    = useState<Assessment[] | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    api.get<Assessment[]>("/self-assessments/")
      .then(setRows)
      .catch(e => setError(e instanceof ApiError ? e.detail : "Erreur de chargement"))
  }, [])

  useEffect(() => {
    if (rows && rows.length > 0) {
      router.replace(`/${locale}/eleve/bilan/${rows[0].id}`)
    }
  }, [rows, locale, router])

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
  if (!rows)  return <div className="h-48 animate-pulse rounded-3xl bg-slate-100"/>
  if (rows.length === 0) return <StudentBilanIntro locale={locale}/>

  return <div className="h-48 animate-pulse rounded-3xl bg-slate-100"/>
}
