/**
 * Layout dashboard — protégé par middleware auth.
 * Injecte le Header avec bouton de déconnexion et la Sidebar commune.
 */

import { LogoutButton } from "@/components/auth/LogoutButton"

interface DashboardLayoutProps {
  children: React.ReactNode
  params:   Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen bg-[var(--bg-subtle)]">
      {/* TODO PHASE 2 : <Sidebar /> */}
      <aside className="w-64 shrink-0 bg-[var(--bg-base)] shadow-[var(--shadow-sm)]" />

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-base)] px-6">
          <span className="font-semibold text-[var(--color-primary-500)]">
            MIABO
          </span>
          <LogoutButton locale={locale} />
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
