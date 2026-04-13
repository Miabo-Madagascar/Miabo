/**
 * Page création d'un nouveau bilan — CANOPE.
 */

import { AssessmentWizard } from "@/components/canope/AssessmentWizard"

interface Props { params: Promise<{ locale: string }> }

export default async function NouveauBilanPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Nouveau bilan</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Renseignez les informations du jeune pour démarrer le bilan d&apos;orientation.
        </p>
      </div>
      <AssessmentWizard locale={locale} basePath="canope" />
    </div>
  )
}
