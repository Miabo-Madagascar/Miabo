/**
 * SessionStatusBadge — badge coloré selon le statut d'une session.
 */

import { SessionStatus } from "@/types"

const STATUS_CONFIG: Record<SessionStatus, { label: string; classes: string }> = {
  [SessionStatus.PendingParent]: {
    label:   "Attente parent",
    classes: "bg-orange-100 text-orange-700",
  },
  [SessionStatus.PendingTutor]: {
    label:   "Attente tuteur",
    classes: "bg-yellow-100 text-yellow-700",
  },
  [SessionStatus.Confirmed]: {
    label:   "Confirmée",
    classes: "bg-green-100 text-green-700",
  },
  [SessionStatus.InProgress]: {
    label:   "En cours",
    classes: "bg-blue-100 text-blue-700",
  },
  [SessionStatus.Completed]: {
    label:   "Terminée",
    classes: "bg-gray-100 text-gray-600",
  },
  [SessionStatus.Cancelled]: {
    label:   "Annulée",
    classes: "bg-red-100 text-red-600",
  },
  [SessionStatus.Disputed]: {
    label:   "Litige",
    classes: "bg-purple-100 text-purple-700",
  },
}

interface SessionStatusBadgeProps {
  status: SessionStatus
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: "bg-gray-100 text-gray-600" }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
