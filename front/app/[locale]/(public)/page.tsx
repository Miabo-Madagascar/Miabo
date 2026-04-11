/**
 * Page d'accueil publique — landing MIABO avec navigation vers l'authentification.
 */

import Link from "next/link"

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-subtle)]">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-[var(--bg-base)] shadow-sm">
        <span className="text-xl font-bold text-[var(--color-primary-500)]">
          MIABO
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href={`/${locale}/auth/login`}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-lg bg-[var(--color-primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-600)] transition-colors"
          >
            Créer un compte
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold text-[var(--color-primary-500)]">
          MIABO
        </h1>
        <p className="mt-4 max-w-md text-lg text-[var(--text-secondary)]">
          Plateforme de tutorat scolaire bilingue pour Madagascar.
          Trouvez un tuteur certifié CANOPE, réservez une session et progressez.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-xl bg-[var(--color-primary-500)] px-8 py-3 font-semibold text-white hover:bg-[var(--color-primary-600)] transition-colors"
          >
            Commencer gratuitement
          </Link>
          <Link
            href={`/${locale}/auth/login`}
            className="rounded-xl border border-[var(--color-primary-500)] px-8 py-3 font-semibold text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-colors"
          >
            {"J'ai déjà un compte"}
          </Link>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-[var(--text-tertiary)]">
        © 2026 MIABO · Madagascar
      </footer>
    </div>
  )
}
