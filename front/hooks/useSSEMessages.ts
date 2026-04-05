/**
 * useSSEMessages — abonnement SSE aux nouveaux messages d'une conversation.
 * Remplace Supabase Realtime par un flux Server-Sent Events via FastAPI.
 * Se reconnecte automatiquement en cas de coupure (délai 3 s).
 */

import { useEffect } from "react"
import { getAccessToken } from "@/lib/supabase/client"
import { api } from "@/lib/api/client"
import { useMessageStore, type ChatMessage } from "@/stores/messageStore"

export function useSSEMessages(
  conversationId: string,
  userId: string | undefined,
): void {
  const { addMessage, markRead } = useMessageStore()

  useEffect(() => {
    if (!userId) return

    let active = true
    const controller = new AbortController()

    async function connect(): Promise<void> {
      try {
        const res = await fetch(
          `/api/backend/messages/conversations/${conversationId}/stream`,
          {
            headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
            signal:  controller.signal,
          },
        )

        if (!res.ok || !res.body) return

        const reader  = res.body.getReader()
        const decoder = new TextDecoder()
        let   buffer  = ""

        while (active) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            try {
              const msg = JSON.parse(line.slice(6)) as ChatMessage
              // Le backend renvoie is_mine selon le sender, mais on recalcule
              // côté client pour garantir la cohérence avec l'utilisateur courant.
              msg.is_mine = msg.sender_id === userId
              addMessage(msg)
              if (!msg.is_mine) {
                api.post(`/messages/conversations/${conversationId}/read`).catch(() => {})
                markRead(conversationId)
              }
            } catch {
              // Ligne malformée — on ignore
            }
          }
        }
      } catch {
        // Reconnexion automatique sauf si l'abort est volontaire (démontage)
        if (active) setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      active = false
      controller.abort()
    }
  }, [conversationId, userId, addMessage, markRead])
}
