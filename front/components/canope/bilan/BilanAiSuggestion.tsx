"use client"

/**
 * Composant d'assistance IA — génère une synthèse d'orientation via GPT-4o-mini.
 * Placé dans la section synthèse du bilan pour aider le conseiller à rédiger.
 */

import { useState }      from "react"
import { api, ApiError } from "@/lib/api/client"

interface Props {
  assessmentId: string
  onUse:        (text: string) => void
}

export function BilanAiSuggestion({ assessmentId, onUse }: Props) {
  const [loading, setLoading] = useState(false)
  const [text,    setText]    = useState("")
  const [error,   setError]   = useState<string | null>(null)

  const generate = async () => {
    setLoading(true); setText(""); setError(null)
    try {
      const res = await api.post<{ text: string }>(
        `/assessments/${assessmentId}/ai-analysis`,
      )
      setText(res.text)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la génération")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
          <span className="text-[12px] font-bold text-violet-800">Aide IA · MIABO</span>
        </div>
        <button onClick={generate} disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-violet-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
              Génération…
            </>
          ) : (
            "Générer une synthèse"
          )}
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">{error}</p>
      )}

      {text && (
        <div className="space-y-3">
          <p className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap">{text}</p>
          <button onClick={() => onUse(text)}
            className="text-[11px] font-bold text-violet-700 hover:text-violet-900 underline underline-offset-2 transition">
            Utiliser comme base de rédaction →
          </button>
        </div>
      )}

      {!text && !loading && !error && (
        <p className="text-[12px] text-slate-500">
          Cliquez sur « Générer » pour obtenir une synthèse d&apos;orientation personnalisée basée sur les 3 tests.
        </p>
      )}
    </div>
  )
}
