/**
 * Dashboard CANOPE — bilans d'orientation, ressources pédagogiques, profil.
 * CANOPE administre les bilans VAK/RIASEC/DISC pour les élèves inscrits sur MIABO.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"

interface Props { params: Promise<{ locale: string }> }

export default async function CanopeDashboardPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${locale}/canope/bilans`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">📊</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Bilans d&apos;orientation</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Créez et gérez les bilans VAK, RIASEC et DISC des élèves.
          </p>
        </Link>

        <Link
          href={`/${locale}/canope/ressources`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">📚</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Ressources pédagogiques</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Publiez et gérez les ressources certifiées CANOPE.
          </p>
        </Link>

        <Link
          href={`/${locale}/messages`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">💬</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Messages</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Échangez avec les élèves et leurs familles.
          </p>
        </Link>

        <Link
          href={`/${locale}/profil`}
          className="flex flex-col gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-5 hover:border-[var(--color-primary-300)] hover:shadow-[var(--shadow-sm)] transition-all"
        >
          <span className="text-2xl">👤</span>
          <h3 className="font-semibold text-[var(--text-primary)]">Mon profil</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Modifiez vos informations personnelles.
          </p>
        </Link>
      </div>
    </div>
  )
}
