/**
 * Dashboard parent — suivi des enfants liés.
 */

import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"

export default function ParentDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 opacity-60">
          <span className="text-2xl">👶</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Mes enfants</h3>
          <p className="text-sm text-[var(--text-secondary)]">Disponible en Phase 3.</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 opacity-60">
          <span className="text-2xl">💳</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Paiements</h3>
          <p className="text-sm text-[var(--text-secondary)]">Disponible en Phase 4.</p>
        </div>
      </div>
    </div>
  )
}
