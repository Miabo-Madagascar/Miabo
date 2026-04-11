/**
 * Page recherche tuteurs — liste paginée avec filtres.
 */

import { TutorSearchClient } from "@/components/matching/TutorSearchClient"

interface Props { params: Promise<{ locale: string }> }

export default async function TuteursPage({ params }: Props) {
  const { locale } = await params
  return <TutorSearchClient locale={locale} />
}
