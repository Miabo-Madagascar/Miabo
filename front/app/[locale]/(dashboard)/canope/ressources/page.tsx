/**
 * Page ressources pédagogiques — CANOPE.
 */

import { ResourceListClient } from "@/components/canope/ResourceListClient"

export default async function CanopRessourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Ressources pédagogiques</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Publiez et gérez les ressources certifiées CANOPE accessibles aux élèves et tuteurs.
        </p>
      </div>
      <ResourceListClient />
    </div>
  )
}
