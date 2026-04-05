"use client"
/**
 * PaymentForm — initiation paiement MVola ou Orange Money.
 * Affiche les instructions push puis le bouton de confirmation (sandbox).
 */

import { useState } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface PaymentFormProps {
  sessionId:    string
  amountAriary: number
  onSuccess:    () => void
}

type Method = "mvola" | "orange_money"

const METHOD_CONFIG: Record<Method, { label: string; prefix: string; color: string }> = {
  mvola:        { label: "MVola (Telma)",  prefix: "+261 34", color: "bg-red-500" },
  orange_money: { label: "Orange Money",  prefix: "+261 32", color: "bg-orange-500" },
}

type Step = "method" | "phone" | "pending" | "done"

export function PaymentForm({ sessionId, amountAriary, onSuccess }: PaymentFormProps) {
  const [method,    setMethod]    = useState<Method>("mvola")
  const [phone,     setPhone]     = useState("")
  const [step,      setStep]      = useState<Step>("method")
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleInitiate() {
    setIsLoading(true)
    setError(null)
    try {
      const endpoint = method === "mvola" ? "/payments/mvola/initiate" : "/payments/orange/initiate"
      const data = await api.post<{ id: string }>(endpoint, {
        session_id:    sessionId,
        amount_ariary: amountAriary,
        method,
        phone_number:  phone,
      })
      setPaymentId(data.id)
      setStep("pending")
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur d'initiation")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSimulateConfirm() {
    if (!paymentId) return
    setIsLoading(true)
    setError(null)
    try {
      await api.post(`/payments/${paymentId}/simulate-confirm`)
      setStep("done")
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Erreur de confirmation")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="text-4xl">✅</div>
        <p className="font-semibold text-[var(--text-primary)]">Paiement confirmé !</p>
        <p className="text-sm text-[var(--text-secondary)]">
          Les fonds sont sécurisés en escrow et seront débloqués après la session.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-[var(--bg-subtle)] p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Montant à payer</p>
        <p className="text-2xl font-bold text-[var(--color-primary-600)]">
          {amountAriary.toLocaleString("fr-MG")} Ar
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">Commission MIABO 10% incluse</p>
      </div>

      {/* ── Étape 1 : Choix méthode ──────────────────────────────── */}
      {step === "method" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">Méthode de paiement</p>
          {(Object.entries(METHOD_CONFIG) as [Method, typeof METHOD_CONFIG[Method]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setMethod(key)}
                className={[
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  method === key
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                    : "border-[var(--border-default)] hover:bg-[var(--bg-subtle)]",
                ].join(" ")}
              >
                <div className={`h-3 w-3 rounded-full ${cfg.color}`} />
                <span className="font-medium text-[var(--text-primary)]">{cfg.label}</span>
              </button>
            )
          )}
          <Button onClick={() => setStep("phone")} className="mt-2">Continuer</Button>
        </div>
      )}

      {/* ── Étape 2 : Numéro de téléphone ────────────────────────── */}
      {step === "phone" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Entrez le numéro {METHOD_CONFIG[method].label} qui recevra la notification push.
          </p>
          <Input
            label="Numéro de téléphone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={`${METHOD_CONFIG[method].prefix} 00 000 00`}
          />
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">{error}</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("method")} className="flex-1">Retour</Button>
            <Button onClick={handleInitiate} isLoading={isLoading} disabled={!phone} className="flex-1">
              Payer
            </Button>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Attente confirmation push ──────────────────── */}
      {step === "pending" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">En attente de confirmation</p>
            <p className="mt-1">
              Une notification push a été envoyée sur <strong>{phone}</strong>.
              Validez le paiement sur votre téléphone.
            </p>
          </div>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">{error}</p>
          )}
          <Button onClick={handleSimulateConfirm} isLoading={isLoading} variant="outline">
            Simuler la confirmation (sandbox)
          </Button>
        </div>
      )}
    </div>
  )
}
