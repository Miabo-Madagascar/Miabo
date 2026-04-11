"use client"
/**
 * ChatWindowWrapper — charge les infos de la conversation puis monte ChatWindow.
 * Nécessaire car ChatWindow a besoin du nom de l'autre participant.
 */

import { useState, useEffect } from "react"
import { api, ApiError } from "@/lib/api/client"
import { ChatWindow } from "./ChatWindow"
import type { Conversation } from "@/stores/messageStore"

interface ChatWindowWrapperProps {
  convId: string
  locale: string
}

export function ChatWindowWrapper({ convId, locale: _locale }: ChatWindowWrapperProps) {
  const [conv,      setConv]      = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    // Récupère la conversation depuis la liste (déjà chargée) ou via l'API
    async function load() {
      try {
        const convs = await api.get<Conversation[]>("/messages/conversations")
        const found = convs.find((c) => c.id === convId) ?? null
        setConv(found)
      } catch (err) {
        setError(err instanceof ApiError ? err.detail : "Conversation introuvable")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [convId])

  if (isLoading) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-500)] border-t-transparent" />
    </div>
  )

  if (error || !conv) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-[var(--color-error)]">{error ?? "Conversation introuvable"}</p>
    </div>
  )

  return (
    <ChatWindow
      conversationId={convId}
      otherUserName={conv.other_user.full_name}
    />
  )
}
