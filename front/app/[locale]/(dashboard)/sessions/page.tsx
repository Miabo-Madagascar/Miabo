/**
 * Page liste des sessions — accessible à tous les rôles authentifiés.
 */

import { SessionsViewManager } from "@/components/sessions/SessionsViewManager"

interface Props { params: Promise<{ locale: string }> }

export default async function SessionsPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">
          Mes sessions
        </h1>
      </div>
      <SessionsViewManager locale={locale} />
    </div>
  )
}
