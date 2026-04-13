"use client"
/**
 * DashboardUserBadge — avatar + nom complet de l'utilisateur connecté.
 * Affiché en haut à droite du header dashboard (CDC §5).
 */

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import type { FullProfile } from "@/types"

/** Initiales depuis un nom complet : "Jean Rakoto" → "JR" */
function toInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("")
}

const ROLE_LABELS: Record<string, string> = {
  student: "Élève",
  tutor:   "Tuteur",
  parent:  "Parent",
  admin:   "Administrateur",
  canope:  "Acteur CANOPE",
  cosp:    "COSP",
}

export function DashboardUserBadge() {
  const [profile, setProfile] = useState<FullProfile | null>(null)

  useEffect(() => {
    api.get<FullProfile>("/profiles/me")
      .then(setProfile)
      .catch(() => {})
  }, [])

  if (!profile) return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 animate-pulse rounded-xl bg-bg-muted" />
      <div className="hidden flex-col gap-1 sm:flex">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-muted" />
        <div className="h-2.5 w-16 animate-pulse rounded bg-bg-muted" />
      </div>
    </div>
  )

  const name      = profile.full_name || "Utilisateur"
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role

  return (
    <div className="flex items-center gap-2.5">
      {profile.avatar_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={profile.avatar_url} alt={name}
          className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
          {toInitials(name)}
        </div>
      )}
      <div className="hidden flex-col sm:flex">
        <span className="max-w-[140px] truncate text-sm font-semibold text-text-primary leading-tight">
          {name}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
          {roleLabel}
        </span>
      </div>
    </div>
  )
}
