/**
 * Dashboard tuteur — accueil avec accès rapide sessions.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"

interface Props { params: Promise<{ locale: string }> }

export default async function TuteurDashboardPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${locale}/sessions`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">📅</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Mes sessions</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Confirmez ou refusez les demandes de réservation.
          </p>
        </Link>

        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 opacity-60">
          <span className="text-2xl">💰</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Mon wallet</h3>
          <p className="text-sm text-[var(--text-secondary)]">Disponible en Phase 4.</p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 opacity-60">
          <span className="text-2xl">⭐</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Mes avis</h3>
          <p className="text-sm text-[var(--text-secondary)]">Disponible en Phase 3.</p>
        </div>
      </div>
    </div>
  )
}
