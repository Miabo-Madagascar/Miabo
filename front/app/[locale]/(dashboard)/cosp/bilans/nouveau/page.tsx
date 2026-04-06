/**
 * Page création d'un nouveau bilan — COSP.
 */

import { AssessmentWizard } from "@/components/canope/AssessmentWizard"

interface Props { params: Promise<{ locale: string }> }

export default async function CospNouveauBilanPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Nouveau bilan</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Option A : élève inscrit sur MIABO — Option B : jeune externe sans compte.
        </p>
      </div>
      <AssessmentWizard locale={locale} basePath="cosp" />
    </div>
  )
}
