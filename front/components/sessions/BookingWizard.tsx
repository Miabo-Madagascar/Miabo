"use client"
/**
 * BookingWizard — wizard de réservation en 4 étapes.
 * Étape 1 : Matière  |  2 : Date/heure  |  3 : Durée/mode  |  4 : Récap & envoi
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { TutorCard } from "@/types"

interface BookingWizardProps {
  tutor:  TutorCard
  locale: string
}

interface BookingForm {
  subject:         string
  scheduled_date:  string
  scheduled_time:  string
  duration_minutes: 60 | 90 | 120 | 180
  mode:            "online" | "in_person"
  notes:           string
}

const DURATIONS: { value: 60 | 90 | 120 | 180; label: string }[] = [
  { value: 60,  label: "1h" },
  { value: 90,  label: "1h30" },
  { value: 120, label: "2h" },
  { value: 180, label: "3h" },
]

const TOTAL_STEPS = 4

export function BookingWizard({ tutor, locale }: BookingWizardProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [step, setStep]       = useState(1)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<BookingForm>({
    subject:          tutor.subjects[0] ?? "",
    scheduled_date:   "",
    scheduled_time:   "14:00",
    duration_minutes: 60,
    mode:             "online",
    notes:            "",
  })

  const set = <K extends keyof BookingForm>(k: K, v: BookingForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const amountAriary = Math.round(tutor.hourly_rate * form.duration_minutes / 60)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error("Non connecté")

      const scheduledAt = new Date(
        `${form.scheduled_date}T${form.scheduled_time}:00`
      ).toISOString()

      const res = await fetch("/api/backend/sessions/", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutor_id:         tutor.id,
          subject:          form.subject,
          scheduled_at:     scheduledAt,
          duration_minutes: form.duration_minutes,
          mode:             form.mode,
          notes:            form.notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? "Erreur lors de la réservation")
      }

      router.push(`/${locale}/sessions`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Indicateur d'étapes ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              i + 1 <= step
                ? "bg-[var(--color-primary-500)] text-white"
                : "bg-[var(--bg-muted)] text-[var(--text-tertiary)]",
            ].join(" ")}>
              {i + 1}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div className={[
                "h-0.5 flex-1",
                i + 1 < step ? "bg-[var(--color-primary-500)]" : "bg-[var(--bg-muted)]",
              ].join(" ")} />
            )}
          </div>
        ))}
      </div>

      {/* ── Étape 1 : Matière ────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Quelle matière ?</h2>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((s) => (
              <button
                key={s}
                onClick={() => set("subject", s)}
                className={[
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  form.subject === s
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
          {tutor.subjects.length === 0 && (
            <Input
              label="Matière"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Ex: Mathématiques"
            />
          )}
        </div>
      )}

      {/* ── Étape 2 : Date & heure ───────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Quand ?</h2>
          <Input
            label="Date"
            type="date"
            value={form.scheduled_date}
            onChange={(e) => set("scheduled_date", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <Input
            label="Heure"
            type="time"
            value={form.scheduled_time}
            onChange={(e) => set("scheduled_time", e.target.value)}
          />
        </div>
      )}

      {/* ── Étape 3 : Durée & mode ───────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Durée & format</h2>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Durée</p>
            <div className="flex gap-2">
              {DURATIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => set("duration_minutes", value)}
                  className={[
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    form.duration_minutes === value
                      ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Format</p>
            <div className="flex gap-2">
              {(["online", "in_person"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => set("mode", m)}
                  className={[
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    form.mode === m
                      ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                  ].join(" ")}
                >
                  {m === "online" ? "En ligne" : "En présentiel"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Étape 4 : Récapitulatif ──────────────────────────────── */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Récapitulatif</h2>
          <div className="rounded-xl bg-[var(--bg-subtle)] p-4 text-sm">
            <p><span className="font-medium">Tuteur :</span> {tutor.full_name}</p>
            <p><span className="font-medium">Matière :</span> {form.subject}</p>
            <p><span className="font-medium">Date :</span> {form.scheduled_date} à {form.scheduled_time}</p>
            <p><span className="font-medium">Durée :</span> {DURATIONS.find(d => d.value === form.duration_minutes)?.label}</p>
            <p><span className="font-medium">Format :</span> {form.mode === "online" ? "En ligne" : "En présentiel"}</p>
            <p className="mt-2 text-base font-bold text-[var(--color-primary-600)]">
              Total : {amountAriary.toLocaleString("fr-MG")} Ar
            </p>
          </div>
          <Input
            label="Objectifs / notes pour le tuteur (optionnel)"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Ce que vous souhaitez travailler..."
          />
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">
              {error}
            </p>
          )}
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────────── */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            Retour
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="flex-1"
            disabled={step === 1 && !form.subject || step === 2 && !form.scheduled_date}
          >
            Suivant
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={loading} className="flex-1">
            Envoyer la demande
          </Button>
        )}
      </div>
    </div>
  )
}
