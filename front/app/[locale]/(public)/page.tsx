/**
 * Page d'accueil publique — landing MIABO.
 * TODO PHASE 2 : implémenter la landing avec hero, tuteurs en vedette, CTA.
 */

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-[var(--color-primary-500)]">
        MIABO
      </h1>
      <p className="mt-4 text-[var(--text-secondary)]">
        Plateforme de tutorat scolaire — Madagascar
      </p>
    </main>
  )
}
