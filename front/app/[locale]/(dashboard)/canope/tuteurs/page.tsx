import { PendingTutorsClient } from "@/components/canope/PendingTutorsClient"

export default function CanopeTutorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Validation des tuteurs</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Examinez et approuvez les inscriptions des tuteurs sur la plateforme.
          </p>
        </div>
      </div>
      <PendingTutorsClient />
    </div>
  )
}
