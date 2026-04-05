/**
 * Page inscription — création de compte multi-rôle.
 * TODO PHASE 1 : brancher RegisterForm + action Supabase.
 */

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-subtle)]">
      <div className="w-full max-w-sm rounded-xl bg-[var(--bg-base)] p-8 shadow-[var(--shadow-md)]">
        <h1 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">
          Créer un compte
        </h1>
        {/* TODO PHASE 1 : <RegisterForm /> */}
        <p className="text-sm text-[var(--text-secondary)]">
          Formulaire d'inscription à implémenter.
        </p>
      </div>
    </div>
  )
}
