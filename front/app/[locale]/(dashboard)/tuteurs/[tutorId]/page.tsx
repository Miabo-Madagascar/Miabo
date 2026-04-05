/**
 * Page profil public tuteur + bouton de réservation.
 */

import { TutorPublicProfile } from "@/components/matching/TutorPublicProfile"

interface Props { params: Promise<{ locale: string; tutorId: string }> }

export default async function TutorProfilePage({ params }: Props) {
  const { locale, tutorId } = await params
  return <TutorPublicProfile tutorId={tutorId} locale={locale} />
}
