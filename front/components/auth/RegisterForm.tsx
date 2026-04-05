"use client"
/**
 * Formulaire d'inscription — création compte Supabase + profil FastAPI.
 * Rôles autorisés à l'inscription : student, tutor, parent.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { RoleSelector } from "@/components/auth/RoleSelector"
import { UserRole } from "@/types"

interface RegisterFormProps {
  locale: string
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [fullName,  setFullName]  = useState("")
  const [email,     setEmail]     = useState("")
  const [password,  setPassword]  = useState("")
  const [role,      setRole]      = useState<UserRole>(UserRole.Student)
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 1. Créer le compte Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (authError || !data.user) {
      setError(authError?.message ?? "Erreur lors de l'inscription")
      setIsLoading(false)
      return
    }

    // 2. Créer le profil via FastAPI — envoie le JWT dans le body (sub + email extraits côté serveur)
    const session = data.session
    if (session) {
      await fetch("/api/backend/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token:     session.access_token,
          full_name: fullName,
          role,
        }),
      })
    }

    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nom complet"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        placeholder="Jean Rakoto"
      />
      <Input
        label="Adresse e-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="votre@email.com"
      />
      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        hint="8 caractères minimum"
      />

      <RoleSelector value={role} onChange={setRole} />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Déjà un compte ?{" "}
        <a
          href={`/${locale}/auth/login`}
          className="font-medium text-[var(--color-primary-500)] hover:underline"
        >
          Se connecter
        </a>
      </p>
    </form>
  )
}
