"use client"
/**
 * ResourceListClient — liste et création de ressources pédagogiques CANOPE.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { Resource } from "@/types"

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF", video: "Vidéo", audio: "Audio", quiz: "Quiz", exercise: "Exercice",
}

interface NewForm { title_fr: string; subject: string; type: string; grade_level: string }
const EMPTY: NewForm = { title_fr: "", subject: "", type: "pdf", grade_level: "" }

export function ResourceListClient() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState<NewForm>(EMPTY)
  const [saving,    setSaving]    = useState(false)

  function load() {
    setIsLoading(true)
    api.get<Resource[]>("/resources/")
      .then(setResources)
      .catch((err) => setError(err instanceof ApiError ? err.detail : "Erreur"))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.title_fr || !form.subject) { setError("Titre et matière obligatoires."); return }
    setSaving(true)
    setError(null)
    try {
      await api.post("/resources/", { ...form, is_published: true })
      setForm(EMPTY)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la création")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
  if (error)     return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">{error}</p>

  return (
    <div className="flex flex-col gap-4">
      {/* ── Bouton ajout ────────────────────────────────────────── */}
      {!showForm && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)}>+ Nouvelle ressource</Button>
        </div>
      )}

      {/* ── Formulaire création ─────────────────────────────────── */}
      {showForm && (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 flex flex-col gap-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Nouvelle ressource</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Titre (FR)" value={form.title_fr}
              onChange={(e) => setForm((p) => ({ ...p, title_fr: e.target.value }))} />
            <Input label="Matière" value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Mathématiques, SVT…" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <Input label="Niveau (optionnel)" value={form.grade_level}
              onChange={(e) => setForm((p) => ({ ...p, grade_level: e.target.value }))}
              placeholder="3ème, Terminale…" />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreate} isLoading={saving}>Publier</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY) }}>Annuler</Button>
          </div>
        </div>
      )}

      {/* ── Liste ───────────────────────────────────────────────── */}
      {resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-default)] p-10 text-center text-sm text-[var(--text-secondary)]">
          Aucune ressource publiée.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl bg-[var(--bg-base)] px-4 py-3 shadow-[var(--shadow-sm)]">
              <div>
                <p className="font-medium text-[var(--text-primary)]">{r.title_fr}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {TYPE_LABELS[r.type] ?? r.type} · {r.subject}{r.grade_level ? ` · ${r.grade_level}` : ""}
                </p>
              </div>
              {r.file_url && (
                <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[var(--color-primary-600)] hover:underline shrink-0">
                  Ouvrir
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
