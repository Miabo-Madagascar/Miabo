/**
 * Store messagerie — état global des conversations et messages.
 * À implémenter avec Zustand ou Context selon le choix final.
 * Migré depuis v1 — adapter aux nouveaux types BDD.
 */

import type { ConversationWithPreview, MessageWithMeta } from "@/types"

export interface MessageStore {
  // Conversations chargées
  conversations:        ConversationWithPreview[]
  activeConversationId: string | null
  messages:             Record<string, MessageWithMeta[]>   // clé = conversation_id

  // Actions
  setConversations:     (convs: ConversationWithPreview[]) => void
  setActiveConversation:(id: string | null) => void
  addMessage:           (conversationId: string, msg: MessageWithMeta) => void
  markRead:             (conversationId: string) => void
  reset:                () => void
}

// TODO : implémenter avec Zustand
// import { create } from "zustand"
// export const useMessageStore = create<MessageStore>((set) => ({ ... }))
