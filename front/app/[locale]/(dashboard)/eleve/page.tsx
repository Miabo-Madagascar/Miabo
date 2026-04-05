/**
 * Dashboard élève — accueil avec accès rapide recherche tuteurs et sessions.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"

interface Props { params: Promise<{ locale: string }> }

export default async function EleveDashboardPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${locale}/tuteurs`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">🔍</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Trouver un tuteur</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Recherchez parmi nos tuteurs certifiés CANOPE.
          </p>
        </Link>

        <Link
          href={`/${locale}/sessions`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">📅</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Mes sessions</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Suivez vos réservations et sessions à venir.
          </p>
        </Link>

        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 opacity-60">
          <span className="text-2xl">🧠</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Tests d'orientation</h3>
          <p className="text-sm text-[var(--text-secondary)]">VAK · RIASEC · DISC — Phase 3.</p>
        </div>
      </div>
    </div>
  )
}
