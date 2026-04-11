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

  // Récupère le rôle direct depuis la base de données (source de vérité)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // Fallback sur user_metadata si la table est inaccessible
  const role     = profile?.role || user.user_metadata?.role as string | undefined
  const rolePath = role ? (ROLE_TO_PATH[role] ?? "eleve") : "eleve"

  redirect(`/${locale}/${rolePath}`)
}
