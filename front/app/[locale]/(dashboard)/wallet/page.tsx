/**
 * Page wallet tuteur — solde, escrow, historique, retrait.
 * Accessible via /[locale]/wallet (réservé aux tuteurs).
 */

import { WalletClient } from "@/components/wallet/WalletClient"

export default async function WalletPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">
        Mon wallet
      </h1>
      <WalletClient />
    </div>
  )
}
