/**
 * Dashboard élève — accueil avec accès rapide recherche tuteurs et sessions.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"
import { DashboardStats } from "@/components/dashboard/DashboardStats"

interface Props { params: Promise<{ locale: string }> }

export default async function EleveDashboardPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-8">
      <DashboardWelcome />

      <DashboardStats role="student" />

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-text-primary">Accès rapide</h3>
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
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📅</span>
          <h3 className="font-semibold text-text-primary">Mes sessions</h3>
          <p className="text-sm text-text-secondary">
            Suivez vos réservations et sessions à venir.
          </p>
        </Link>

        <Link
          href={`/${locale}/messages`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">💬</span>
          <h3 className="font-semibold text-text-primary">Messages</h3>
          <p className="text-sm text-text-secondary">
            Échangez avec vos tuteurs.
          </p>
        </Link>

        <Link
          href={`/${locale}/profil`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">👤</span>
          <h3 className="font-semibold text-text-primary">Mon profil</h3>
          <p className="text-sm text-text-secondary">
            Modifiez vos informations personnelles.
          </p>
        </Link>
      </div>
    </div>
  </div>
)
}
