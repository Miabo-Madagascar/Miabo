/**
 * Page liste des sessions — accessible à tous les rôles authentifiés.
 */

import { SessionListClient } from "@/components/sessions/SessionListClient"

interface Props { params: Promise<{ locale: string }> }

export default async function SessionsPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Mes sessions
      </h1>
      <SessionListClient locale={locale} />
    </div>
  )
}
