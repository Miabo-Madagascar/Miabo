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
import { PasswordInput } from "@/components/ui/PasswordInput"
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

    // Crée le compte Supabase Auth.
    // Le trigger PostgreSQL handle_new_user() crée automatiquement
    // la ligne profiles + le sous-profil métier dès l'insertion dans auth.users.
    const callbackUrl = `${window.location.origin}/api/auth/callback`
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data:            { full_name: fullName, role },
        emailRedirectTo: callbackUrl,
      },
    })

    if (authError || !data.user) {
      setError(authError?.message ?? "Erreur lors de l'inscription")
      setIsLoading(false)
      return
    }

    // Supabase retourne identities:[] quand l'email existe déjà mais n'est pas confirmé,
    // sans retourner d'erreur — on doit le détecter manuellement.
    if (data.user.identities?.length === 0) {
      setError("Un compte avec cet email existe déjà. Consultez votre boîte mail ou connectez-vous.")
      setIsLoading(false)
      return
    }

    if (!data.session) {
      // Email de confirmation requis.
      // Stocker les données d'inscription dans un cookie pour la route /api/auth/callback
      // qui créera le profil FastAPI après confirmation de l'email.
      const pending = encodeURIComponent(
        JSON.stringify({ full_name: fullName, role, locale })
      )
      document.cookie = `miabo_pending_register=${pending}; path=/; max-age=3600; SameSite=Lax`

      setError(
        "Compte créé ! Vérifiez votre boîte mail et confirmez votre adresse pour vous connecter."
      )
      setIsLoading(false)
      return
    }

    // Session disponible directement (confirmation désactivée en dev)
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
      <PasswordInput
        label="Mot de passe"
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
