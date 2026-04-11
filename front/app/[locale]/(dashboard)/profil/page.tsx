/**
 * Page édition de profil — accessible à tous les rôles authentifiés.
 */

import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm"

export default async function ProfilPage() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mon profil</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Modifiez vos informations personnelles et préférences.
        </p>
      </div>
      <ProfileEditForm />
    </div>
  )
}
