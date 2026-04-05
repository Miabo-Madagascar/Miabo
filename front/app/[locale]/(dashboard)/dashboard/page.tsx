/**
 * Page /dashboard — redirige vers le dashboard du rôle de l'utilisateur.
 * Ex : tuteur → /fr/tuteur | élève → /fr/eleve
 */

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const ROLE_TO_PATH: Record<string, string> = {
  student: "eleve",
  tutor:   "tuteur",
  parent:  "parent",
  admin:   "admin",
  canope:  "canope",
  cosp:    "cosp",
}

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const supabase   = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth/login`)

  // Récupérer le rôle depuis les user_metadata (renseigné à l'inscription)
  const role     = user.user_metadata?.role as string | undefined
  const rolePath = role ? (ROLE_TO_PATH[role] ?? "eleve") : "eleve"

  redirect(`/${locale}/${rolePath}`)
}
