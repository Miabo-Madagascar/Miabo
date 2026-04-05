"use client"
/**
 * DashboardWelcome — bandeau d'accueil personnalisé selon le rôle.
 * Affiche le nom de l'utilisateur et les infos de son profil.
 */

import { useAuth } from "@/hooks/useAuth"
import { UserRole } from "@/types"

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Student]: "Élève",
  [UserRole.Tutor]:   "Tuteur",
  [UserRole.Parent]:  "Parent",
  [UserRole.Admin]:   "Administrateur",
  [UserRole.Canope]:  "Conseiller CANOPE",
  [UserRole.Cosp]:    "Conseiller COSP",
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.Student]: "Trouvez un tuteur, réservez vos sessions et progressez.",
  [UserRole.Tutor]:   "Gérez votre agenda, vos sessions et votre wallet.",
  [UserRole.Parent]:  "Suivez vos enfants et gérez leurs sessions.",
  [UserRole.Admin]:   "Gérez la plateforme, validez les tuteurs.",
  [UserRole.Canope]:  "Administrez les bilans d'orientation.",
  [UserRole.Cosp]:    "Administrez les bilans et accompagnez les jeunes externes.",
}

export function DashboardWelcome() {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-20 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
    )
  }

  if (!profile) return null

  const role      = profile.role as UserRole
  const roleLabel = ROLE_LABELS[role] ?? role
  const roleDesc  = ROLE_DESCRIPTIONS[role] ?? ""

  return (
    <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] p-6 text-white">
      <p className="text-sm font-medium opacity-80">{roleLabel}</p>
      <h1 className="mt-1 text-2xl font-bold">
        Bonjour, {profile.full_name.split(" ")[0]} !
      </h1>
      <p className="mt-1 text-sm opacity-80">{roleDesc}</p>
    </div>
  )
}
