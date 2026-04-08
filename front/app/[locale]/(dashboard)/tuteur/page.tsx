/**
 * Dashboard tuteur — accueil avec accès rapide sessions.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"
import { DashboardStats } from "@/components/dashboard/DashboardStats"

interface Props { params: Promise<{ locale: string }> }

export default async function TuteurDashboardPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-8">
      <DashboardWelcome />
      
      <DashboardStats role="tutor" />

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-text-primary">Accès rapide</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${locale}/sessions`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📅</span>
          <h3 className="font-semibold text-text-primary">Mes sessions</h3>
          <p className="text-sm text-text-secondary">
            Confirmez ou refusez les demandes de réservation.
          </p>
        </Link>

        <Link
          href={`/${locale}/tuteur/disponibilites`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">📆</span>
          <h3 className="font-semibold text-text-primary">Mes disponibilités</h3>
          <p className="text-sm text-text-secondary">
            Gérez vos créneaux hebdomadaires.
          </p>
        </Link>

        <Link
          href={`/${locale}/wallet`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">💰</span>
          <h3 className="font-semibold text-text-primary">Mon wallet</h3>
          <p className="text-sm text-text-secondary">
            Solde, escrows en attente et retraits Mobile Money.
          </p>
        </Link>

        <Link
          href={`/${locale}/messages`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">💬</span>
          <h3 className="font-semibold text-text-primary">Messages</h3>
          <p className="text-sm text-text-secondary">
            Échangez avec vos élèves.
          </p>
        </Link>

        <Link
          href={`/${locale}/profil`}
          className="flex flex-col gap-2 rounded-xl border border-border bg-bg-base p-5 hover:border-primary-300 hover:shadow-sm transition-all"
        >
          <span className="text-2xl">👤</span>
          <h3 className="font-semibold text-text-primary">Mon profil</h3>
          <p className="text-sm text-text-secondary">
            Bio, matières, tarif et localisation.
          </p>
        </Link>
      </div>
    </div>
  </div>
)
}
