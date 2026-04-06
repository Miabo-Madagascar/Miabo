/**
 * Page gestion des disponibilités — accessible au tuteur connecté.
 */

import { AvailabilityManager } from "@/components/matching/AvailabilityManager"

export default async function DisponibilitesPage() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Mes disponibilités
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Définissez vos créneaux hebdomadaires. Les élèves pourront réserver
          uniquement sur ces plages horaires.
        </p>
      </div>
      <AvailabilityManager />
    </div>
  )
}
