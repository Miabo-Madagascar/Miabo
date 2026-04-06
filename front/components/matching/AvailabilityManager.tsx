"use client"
/**
 * AvailabilityManager — gestion des créneaux de disponibilité tuteur.
 * Affiche les créneaux récurrents par jour et permet d'en ajouter ou supprimer.
 */

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface Slot {
  id:            string
  day_of_week:   number | null
  specific_date: string | null
  start_time:    string
  end_time:      string
  is_available:  boolean
}

interface AddForm {
  day_of_week: string
  start_time:  string
  end_time:    string
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

export function AvailabilityManager() {
  const [slots,     setSlots]     = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [adding,    setAdding]    = useState(false)
  const [form,      setForm]      = useState<AddForm>({
    day_of_week: "0",
    start_time:  "08:00",
    end_time:    "10:00",
  })

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<Slot[]>("/tutors/me/availabilities")
      setSlots(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Impossible de charger les créneaux.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    setAdding(true)
    setError(null)
    try {
      await api.post("/tutors/me/availabilities", {
        day_of_week: parseInt(form.day_of_week, 10),
        start_time:  form.start_time,
        end_time:    form.end_time,
      })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de l'ajout du créneau.")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await api.delete(`/tutors/me/availabilities/${id}`)
      setSlots((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur lors de la suppression.")
    }
  }

  const recurringSlots = slots.filter((s) => s.day_of_week !== null)
  const byDay = DAYS.map((label, idx) => ({
    label,
    slots: recurringSlots.filter((s) => s.day_of_week === idx),
  }))

  if (isLoading) return <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-muted)]" />

  return (
    <div className="flex flex-col gap-6">
      {/* ── Créneaux par jour ────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {byDay.map(({ label, slots: daySlots }) => daySlots.length > 0 && (
          <div key={label} className="rounded-xl bg-[var(--bg-base)] p-4 shadow-[var(--shadow-sm)]">
            <p className="mb-2 font-medium text-[var(--text-primary)]">{label}</p>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-sm">
                  <span className="text-[var(--text-secondary)]">{s.start_time} – {s.end_time}</span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-[var(--color-error)] hover:opacity-70 transition-opacity leading-none"
                    aria-label={`Supprimer ${label} ${s.start_time}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {recurringSlots.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-secondary)]">
            Aucun créneau défini. Commencez par en ajouter un ci-dessous.
          </div>
        )}
      </div>

      {/* ── Formulaire d'ajout ───────────────────────────────── */}
      <div className="rounded-xl bg-[var(--bg-base)] p-5 shadow-[var(--shadow-sm)]">
        <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Ajouter un créneau récurrent</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Jour</label>
            <select
              value={form.day_of_week}
              onChange={(e) => setForm((p) => ({ ...p, day_of_week: e.target.value }))}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <Input label="Début" type="time" value={form.start_time}
            onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} />
          <Input label="Fin" type="time" value={form.end_time}
            onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} />
        </div>
        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">{error}</p>
        )}
        <div className="mt-4">
          <Button onClick={handleAdd} isLoading={adding}>Ajouter ce créneau</Button>
        </div>
      </div>
    </div>
  )
}
