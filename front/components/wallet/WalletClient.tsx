"use client"
/**
 * WalletClient — solde, escrows en attente, historique et retrait tuteur.
 */

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type PaymentMethod = "mvola" | "orange_money"

interface WalletData {
  wallet_balance:  number
  pending_escrow:  number
  transactions:    Transaction[]
}

interface Transaction {
  id:            string
  status:        string
  amount_ariary: number
  release_at:    string
  released_at:   string | null
}

export function WalletClient() {
  const [wallet,       setWallet]       = useState<WalletData | null>(null)
  const [isLoading,    setIsLoading]    = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [amount,       setAmount]       = useState("")
  const [phone,        setPhone]        = useState("")
  const [method,       setMethod]       = useState<PaymentMethod>("mvola")
  const [withdrawing,  setWithdrawing]  = useState(false)
  const [withdrawMsg,  setWithdrawMsg]  = useState<string | null>(null)

  const loadWallet = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Pas de trailing slash pour éviter le 308 redirect de Next.js
      const data = await api.get<WalletData>("/wallet")
      setWallet(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Impossible de charger le wallet")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadWallet() }, [loadWallet])

  async function handleWithdraw() {
    const amountNum = parseInt(amount, 10)
    if (!amountNum || amountNum < 5000) {
      setWithdrawMsg("Montant minimum : 5 000 Ar")
      return
    }
    setWithdrawing(true)
    setWithdrawMsg(null)
    try {
      await api.post<{ new_balance: number }>("/wallet/withdraw", {
        amount_ariary: amountNum,
        method,
        phone_number:  phone,
      })
      setWithdrawMsg(`Retrait de ${amountNum.toLocaleString("fr-MG")} Ar effectué.`)
      setShowWithdraw(false)
      setAmount("")
      setPhone("")
      await loadWallet()
    } catch (err) {
      setWithdrawMsg(err instanceof ApiError ? err.detail : "Erreur de retrait")
    } finally {
      setWithdrawing(false)
    }
  }

  if (isLoading) return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
      ))}
    </div>
  )

  if (error) return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-error)]">{error}</p>
  )

  if (!wallet) return null

  return (
    <div className="flex flex-col gap-6">
      {/* ── Solde ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--color-primary-600)] p-6 text-white">
          <p className="text-sm opacity-80">Solde disponible</p>
          <p className="mt-1 text-3xl font-bold">
            {wallet.wallet_balance.toLocaleString("fr-MG")} Ar
          </p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <p className="text-sm text-yellow-700">En escrow</p>
          <p className="mt-1 text-3xl font-bold text-yellow-800">
            {wallet.pending_escrow.toLocaleString("fr-MG")} Ar
          </p>
          <p className="mt-1 text-xs text-yellow-600">Libéré 24h après la session</p>
        </div>
      </div>

      {/* ── Message retrait ─────────────────────────────────────── */}
      {withdrawMsg && (
        <p className={[
          "rounded-md px-3 py-2 text-sm",
          withdrawMsg.includes("effectué")
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-[var(--color-error)]",
        ].join(" ")}>
          {withdrawMsg}
        </p>
      )}

      {/* ── Bouton / formulaire retrait ─────────────────────────── */}
      {!showWithdraw ? (
        <Button variant="outline" onClick={() => setShowWithdraw(true)} disabled={wallet.wallet_balance < 5000}>
          Retirer des fonds
        </Button>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">Demande de retrait</h3>
          <div className="flex gap-3">
            {(["mvola", "orange_money"] as PaymentMethod[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={[
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  method === m
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "border-[var(--border-default)] hover:bg-[var(--bg-subtle)]",
                ].join(" ")}
              >
                {m === "mvola" ? "MVola" : "Orange Money"}
              </button>
            ))}
          </div>
          <Input
            label="Montant (Ar)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="5000"
            hint={`Solde : ${wallet.wallet_balance.toLocaleString("fr-MG")} Ar — min 5 000 Ar`}
          />
          <Input
            label="Numéro de téléphone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={method === "mvola" ? "+261 34 00 000 00" : "+261 32 00 000 00"}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowWithdraw(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleWithdraw}
              isLoading={withdrawing}
              disabled={!amount || !phone}
              className="flex-1"
            >
              Confirmer
            </Button>
          </div>
        </div>
      )}

      {/* ── Historique ──────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Historique</h3>
        {wallet.transactions.length === 0 ? (
          <p className="rounded-xl bg-[var(--bg-subtle)] px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
            Aucune transaction pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {wallet.transactions.map(tx => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-lg bg-[var(--bg-base)] px-4 py-3 shadow-[var(--shadow-sm)]"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {tx.status === "held" ? "Session (Escrow)" : "Crédit wallet"}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {new Date(tx.released_at || tx.release_at).toLocaleDateString("fr-MG", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <span className={[
                  "text-sm font-semibold",
                  tx.status === "released" ? "text-green-600" : "text-yellow-600",
                ].join(" ")}>
                  {tx.status === "released" ? "+" : ""}
                  {tx.amount_ariary.toLocaleString("fr-MG")} Ar
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
