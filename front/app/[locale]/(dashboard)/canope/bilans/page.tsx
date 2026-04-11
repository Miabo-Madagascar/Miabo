/**
 * Page liste des bilans — CANOPE.
 */

import Link from "next/link"
import { AssessmentListClient } from "@/components/canope/AssessmentListClient"
import { TestsInfoModal } from "@/components/canope/TestsInfoModal"

interface Props { params: Promise<{ locale: string }> }

export default async function CanopeBilansPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bilans d&apos;orientation</h1>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-text-secondary">
              Gérez les tests VAK, RIASEC et DISC administrés aux élèves.
            </p>
            <TestsInfoModal />
          </div>
        </div>
        <Link
          href={`/${locale}/canope/bilans/nouveau`}
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-all hover:bg-primary-600 hover:shadow-lg active:scale-95"
        >
          + Nouveau bilan
        </Link>
      </div>
      <AssessmentListClient locale={locale} basePath="canope" />
    </div>
  )
}
