/**
 * Page connexion — authentification Supabase.
 * TODO PHASE 1 : brancher LoginForm + action Supabase.
 */

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-subtle)]">
      <div className="w-full max-w-sm rounded-xl bg-[var(--bg-base)] p-8 shadow-[var(--shadow-md)]">
        <h1 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">
          Connexion
        </h1>
        {/* TODO PHASE 1 : <LoginForm /> */}
        <p className="text-sm text-[var(--text-secondary)]">
          Formulaire de connexion à implémenter.
        </p>
      </div>
    </div>
  )
}
