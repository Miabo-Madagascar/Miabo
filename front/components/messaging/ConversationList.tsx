"use client"
/**
 * ConversationList — liste des conversations avec badges non lus.
 * Les mises à jour temps réel arrivent via le store (alimenté par useSSEMessages
 * dans ChatWindow) — aucun abonnement Realtime ou SSE ici.
 */

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api/client"
import { useMessageStore, type Conversation } from "@/stores/messageStore"

interface ConversationListProps {
  locale:         string
  activeConvId?:  string
}

export function ConversationList({ locale, activeConvId }: ConversationListProps) {
  const router = useRouter()

  const {
    conversations, setConversations, setLoadingConvs, isLoadingConvs,
  } = useMessageStore()

  const load = useCallback(async () => {
    setLoadingConvs(true)
    try {
      const data = await api.get<Conversation[]>("/messages/conversations")
      setConversations(data)
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        console.error("[ConversationList]", err.detail)
      }
    } finally {
      setLoadingConvs(false)
    }
  }, [setConversations, setLoadingConvs])

  useEffect(() => { load() }, [load])

  if (isLoadingConvs) return (
    <div className="flex flex-col gap-2 p-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
      ))}
    </div>
  )

  if (conversations.length === 0) return (
    <div className="p-6 text-center text-sm text-[var(--text-tertiary)]">
      Aucune conversation.
    </div>
  )

  return (
    <ul className="flex flex-col gap-1 p-2">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conv={conv}
          isActive={conv.id === activeConvId}
          onClick={() => router.push(`/${locale}/messages/${conv.id}`)}
        />
      ))}
    </ul>
  )
}

function ConversationItem({
  conv, isActive, onClick,
}: {
  conv:     Conversation
  isActive: boolean
  onClick:  () => void
}) {
  const initial = conv.other_user.full_name.charAt(0).toUpperCase()
  const time    = conv.last_message
    ? new Date(conv.last_message.created_at).toLocaleTimeString("fr-MG", {
        hour: "2-digit", minute: "2-digit",
      })
    : ""

  return (
    <li>
      <button
        onClick={onClick}
        className={[
          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
          isActive
            ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
            : "hover:bg-[var(--bg-subtle)]",
        ].join(" ")}
      >
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-100)] font-semibold text-[var(--color-primary-700)]">
            {initial}
          </div>
          {conv.unread_count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[10px] font-bold text-white">
              {conv.unread_count > 9 ? "9+" : conv.unread_count}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {conv.other_user.full_name}
            </p>
            <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">{time}</span>
          </div>
          {conv.last_message && (
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {conv.last_message.is_mine ? "Vous : " : ""}
              {conv.last_message.content}
            </p>
          )}
        </div>
      </button>
    </li>
  )
}
