/**
 * Page inscription — création compte multi-rôle.
 */

import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-subtle)]">
      <div className="w-full max-w-sm rounded-xl bg-[var(--bg-base)] p-8 shadow-[var(--shadow-md)]">
        <div className="mb-6 text-center">
          <Link
            href={`/${locale}`}
            className="text-2xl font-bold text-[var(--color-primary-500)] hover:opacity-80"
          >
            MIABO
          </Link>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Créer votre compte
          </p>
        </div>
        <RegisterForm locale={locale} />
      </div>
    </div>
  )
}
