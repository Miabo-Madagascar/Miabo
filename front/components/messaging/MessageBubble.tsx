/**
 * MessageBubble — bulle de message individuel.
 * Alignement gauche (reçu) ou droite (envoyé).
 */

import type { ChatMessage } from "@/stores/messageStore"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString("fr-MG", {
    hour:   "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={[
      "flex w-full",
      message.is_mine ? "justify-end" : "justify-start",
    ].join(" ")}>
      <div className={[
        "max-w-[75%] rounded-2xl px-4 py-2.5",
        message.is_mine
          ? "rounded-br-sm bg-[var(--color-primary-500)] text-white"
          : "rounded-bl-sm bg-[var(--bg-base)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]",
      ].join(" ")}>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>
        <p className={[
          "mt-0.5 text-right text-[10px]",
          message.is_mine ? "text-white/70" : "text-[var(--text-tertiary)]",
        ].join(" ")}>
          {time}
        </p>
      </div>
    </div>
  )
}
