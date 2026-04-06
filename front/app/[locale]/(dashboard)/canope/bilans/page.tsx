/**
 * Page liste des bilans — CANOPE.
 */

import Link from "next/link"
import { AssessmentListClient } from "@/components/canope/AssessmentListClient"

interface Props { params: Promise<{ locale: string }> }

export default async function CanopeBilansPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Bilans d&apos;orientation</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Gérez les tests VAK, RIASEC et DISC administrés aux élèves.
          </p>
        </div>
        <Link
          href={`/${locale}/canope/bilans/nouveau`}
          className="rounded-lg bg-[var(--color-primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-600)] transition-colors"
        >
          + Nouveau bilan
        </Link>
      </div>
      <AssessmentListClient locale={locale} basePath="canope" />
    </div>
  )
}
