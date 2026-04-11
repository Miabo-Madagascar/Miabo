"use client"
/**
 * ChatWindow — fenêtre de conversation.
 * Charge les messages via API REST et reçoit les nouveaux via SSE.
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { api, ApiError } from "@/lib/api/client"
import { useMessageStore, type ChatMessage } from "@/stores/messageStore"
import { useSSEMessages } from "@/hooks/useSSEMessages"
import { MessageBubble } from "./MessageBubble"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"

interface ChatWindowProps {
  conversationId: string
  otherUserName:  string
}

export function ChatWindow({ conversationId, otherUserName }: ChatWindowProps) {
  const { user }  = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, setMessages, addMessage, replaceMessage, removeMessage, markRead, setLoadingMsgs } = useMessageStore()
  const convMessages = messages[conversationId] ?? []

  const [text,    setText]    = useState("")
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Abonnement SSE — reçoit les nouveaux messages en temps réel
  useSSEMessages(conversationId, user?.id)

  // Chargement initial + marquage comme lu
  const loadMessages = useCallback(async () => {
    setLoadingMsgs(true)
    try {
      const data = await api.get<ChatMessage[]>(`/messages/conversations/${conversationId}`)
      setMessages(conversationId, data)
      await api.post(`/messages/conversations/${conversationId}/read`)
      markRead(conversationId)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Impossible de charger les messages")
    } finally {
      setLoadingMsgs(false)
    }
  }, [conversationId, setMessages, markRead, setLoadingMsgs])

  useEffect(() => { loadMessages() }, [loadMessages])

  // Scroll automatique vers le dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [convMessages.length])

  async function handleSend() {
    const content = text.trim()
    if (!content || !user) return

    // Ajout optimiste — le message apparaît instantanément avant la réponse serveur
    const tempId = `temp-${Date.now()}`
    addMessage({
      id:              tempId,
      conversation_id: conversationId,
      sender_id:       user.id,
      is_mine:         true,
      content,
      message_type:    "text",
      file_url:        null,
      created_at:      new Date().toISOString(),
    })
    setText("")
    setSending(true)
    setError(null)

    try {
      const confirmed = await api.post<ChatMessage>("/messages", {
        conversation_id: conversationId,
        content,
      })
      // Remplace le message temporaire par la version confirmée (ID réel)
      // Le SSE renverra le même ID — sera ignoré par la déduplication du store
      replaceMessage(tempId, { ...confirmed, is_mine: true })
    } catch (err) {
      removeMessage(tempId)
      setText(content)
      setError(err instanceof ApiError ? err.detail : "Erreur d'envoi")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-100)] font-semibold text-[var(--color-primary-700)]">
          {otherUserName.charAt(0).toUpperCase()}
        </div>
        <p className="font-semibold text-[var(--text-primary)]">{otherUserName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2">
          {convMessages.length === 0 && !error && (
            <p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
              Début de la conversation. Écrivez votre premier message.
            </p>
          )}
          {convMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {error && (
        <p className="mx-4 mb-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-[var(--color-error)]">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2 border-t border-[var(--border-default)] p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message… (Entrée pour envoyer)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-400)] focus:outline-none"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />
        <Button onClick={handleSend} isLoading={sending} disabled={!text.trim()} className="shrink-0">
          Envoyer
        </Button>
      </div>
    </div>
  )
}
