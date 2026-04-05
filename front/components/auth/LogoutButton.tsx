"use client"
/**
 * Bouton de déconnexion — appelle supabase.auth.signOut() et redirige vers /login.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"

interface LogoutButtonProps {
  locale: string
}

export function LogoutButton({ locale }: LogoutButtonProps) {
  const router   = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push(`/${locale}/auth/login`)
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      isLoading={isLoading}
      onClick={handleLogout}
    >
      Se déconnecter
    </Button>
  )
}
