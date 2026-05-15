/**
 * Layout dashboard — protégé par middleware auth.
 * Injecte le Header avec badge utilisateur, cloche et bouton déconnexion.
 */

import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { NotificationBell } from "@/components/dashboard/NotificationBell"
import { DashboardUserBadge } from "@/components/dashboard/DashboardUserBadge"

interface DashboardLayoutProps {
  children: React.ReactNode
  params:   Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Rôle stocké dans user_metadata lors de l'inscription
  const role = user?.user_metadata?.role || "student"

  return (
    <div className="flex h-screen overflow-hidden bg-bg-subtle">
      <Sidebar locale={locale} role={role} />

      {/* min-w-0 empêche le débordement flex du contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg-base px-6">
          <span className="font-semibold text-primary-500">MIABO</span>
          <div className="flex items-center gap-4">
            {/* Photo + nom de l'acteur connecté (CDC §5) */}
            <DashboardUserBadge />
            <NotificationBell locale={locale} />
            <LogoutButton locale={locale} />
          </div>
        </header>

        {/* overflow-auto : seul le contenu scrolle, jamais le sidebar */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
