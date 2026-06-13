"use client"
/**
 * Écran d'accueil de l'auto-bilan — affiché quand l'élève n'a encore aucun bilan.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api/client"
import type { Assessment } from "@/types"
import { TESTS_META } from "@/components/canope/bilan/bilanMeta"

interface Props { locale: string }

export function StudentBilanIntro({ locale }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const created = await api.post<Assessment>("/self-assessments/", {})
      router.push(`/${locale}/eleve/bilan/${created.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la création du bilan")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-blue-700 border border-blue-200">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"/>
          Bilan d&apos;orientation SESAME
        </span>

        <h1 className="mt-4 font-display text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900">
          Découvre ton profil d&apos;orientation
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-600 max-w-xl mx-auto">
          Réponds à 3 courts questionnaires pour mieux comprendre ta façon d&apos;apprendre,
          tes centres d&apos;intérêt et ta personnalité. Un conseiller CANOPE/COSP relira
          ensuite ton bilan et te laissera une synthèse personnalisée.
        </p>

        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3 text-left">
          {(["vak", "riasec", "disc"] as const).map(key => {
            const meta = TESTS_META[key]
            return (
              <div key={key} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-display text-[15px] font-bold text-slate-900">{meta.title}</h3>
                <p className="mt-1 text-[12px] text-slate-500">{meta.subtitle}</p>
                <p className="mt-2 text-[11px] font-semibold text-slate-400">
                  {meta.duration} · {meta.questions} questions
                </p>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button onClick={handleStart} disabled={loading}
          className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-bold text-white shadow-md transition disabled:opacity-60"
          style={{ background: "#3a6cf8", boxShadow: "0 8px 22px rgba(58,108,248,.35)" }}>
          {loading ? "Préparation…" : "Commencer mon bilan d'orientation"}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
