/**
 * Page ressources pédagogiques — COSP.
 */

import { ResourceListClient } from "@/components/canope/ResourceListClient"

export default async function CospRessourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Ressources pédagogiques</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Publiez et gérez les ressources certifiées CANOPE/COSP.
        </p>
      </div>
      <ResourceListClient />
    </div>
  )
}
