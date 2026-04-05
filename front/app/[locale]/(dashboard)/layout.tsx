/**
 * Layout dashboard — protégé par middleware auth.
 * Injecte le Header et la Sidebar communs à tous les dashboards.
 * TODO PHASE 1 : brancher Header + Sidebar + vérification session.
 */

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-subtle)]">
      {/* TODO PHASE 1 : <Sidebar /> */}
      <aside className="w-64 shrink-0 bg-[var(--bg-base)] shadow-[var(--shadow-sm)]" />

      <div className="flex flex-1 flex-col">
        {/* TODO PHASE 1 : <Header /> */}
        <header className="h-16 border-b border-[var(--border-default)] bg-[var(--bg-base)]" />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
