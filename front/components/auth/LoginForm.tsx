"use client"
/**
 * Formulaire de connexion — authentification Supabase Auth.
 * Redirige vers /{locale}/dashboard après connexion selon le rôle.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"

interface LoginFormProps {
  locale: string
}

export function LoginForm({ locale }: LoginFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [email,     setEmail]     = useState("")
  const [password,  setPassword]  = useState("")
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError("Email ou mot de passe incorrect")
      setIsLoading(false)
      return
    }

    // La redirection vers le bon dashboard est gérée par le middleware
    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        autoComplete="current-password"
        placeholder="••••••••"
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
        Se connecter
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Pas encore de compte ?{" "}
        <a
          href={`/${locale}/auth/register`}
          className="font-medium text-[var(--color-primary-500)] hover:underline"
        >
          Créer un compte
        </a>
      </p>
    </form>
  )
}
