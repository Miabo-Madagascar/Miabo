/**
 * Layout dashboard — protégé par middleware auth.
 * Injecte le Header avec bouton de déconnexion et la Sidebar commune.
 */

import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { NotificationBell } from "@/components/dashboard/NotificationBell"

interface DashboardLayoutProps {
  children: React.ReactNode
  params:   Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // On récupère le rôle via les metadata Supabase ou une requête profil
  // Dans Miabo, le rôle est stocké dans user_metadata lors de l'auth
  const role = user?.user_metadata?.role || "student"

  return (
    <div className="flex min-h-screen bg-bg-subtle">
      <Sidebar locale={locale} role={role} />

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-bg-base px-6">
          <span className="font-semibold text-primary-500">
            MIABO
          </span>
          <div className="flex items-center gap-4">
            <NotificationBell locale={locale} />
            <LogoutButton locale={locale} />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
