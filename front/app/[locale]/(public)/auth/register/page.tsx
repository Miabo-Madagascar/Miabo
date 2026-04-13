/**
 * Page inscription — layout split : panneau visuel MIABO + formulaire.
 */

import Link from "next/link"
import Image from "next/image"
import { RegisterForm } from "@/components/auth/RegisterForm"
import AuthPanel from "@/components/auth/AuthPanel"

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params

  return (
    <div className="grid lg:grid-cols-[3fr_2fr] min-h-screen">

      {/* ── Panneau gauche — image + branding ──────────────────────────── */}
      <AuthPanel />

      {/* ── Panneau droit — formulaire ─────────────────────────────────── */}
      <div className="flex flex-col justify-center px-8 md:px-14 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">

          {/* Logo + retour accueil */}
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-10">
            <Image src="/logo.png" alt="MIABO" width={90} height={36} className="h-9 w-auto" />
          </Link>

          <h1 className="font-bold-title text-[40px] text-[#1e1b4b] mb-1">
            Créer un compte
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            Rejoignez la communauté éducative MIABO
          </p>

          <RegisterForm locale={locale} />

        </div>
      </div>
    </div>
  )
}
