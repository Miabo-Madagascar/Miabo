/**
 * Page détail d'une session — confirmation tuteur, approbation parent, annulation.
 */

import { SessionDetailClient } from "@/components/sessions/SessionDetailClient"

interface Props { params: Promise<{ locale: string; sessionId: string }> }

export default async function SessionDetailPage({ params }: Props) {
  const { locale, sessionId } = await params
  return (
    <div className="mx-auto max-w-2xl">
      <SessionDetailClient sessionId={sessionId} locale={locale} />
    </div>
  )
}
