/**
 * Store messagerie — conversations et messages en temps réel.
 * Alimenté par les appels API + Supabase Realtime (nouveaux messages).
 */

import { create } from "zustand"

export interface OtherUser {
  id:         string | null
  full_name:  string
  avatar_url: string | null
}

export interface LastMessage {
  content:    string
  created_at: string
  is_mine:    boolean
}

export interface Conversation {
  id:           string
  session_id:   string | null
  other_user:   OtherUser
  last_message: LastMessage | null
  unread_count: number
  updated_at:   string | null
}

export interface ChatMessage {
  id:              string
  conversation_id: string
  sender_id:       string
  is_mine:         boolean
  content:         string
  message_type:    string
  file_url:        string | null
  created_at:      string
}

interface MessageState {
  conversations:        Conversation[]
  activeConversationId: string | null
  messages:             Record<string, ChatMessage[]>
  isLoadingConvs:       boolean
  isLoadingMsgs:        boolean

  setConversations:      (convs: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setMessages:           (convId: string, msgs: ChatMessage[]) => void
  addMessage:            (msg: ChatMessage) => void
  /** Remplace un message par son ID (ex: optimiste → confirmé par le serveur). */
  replaceMessage:        (tempId: string, msg: ChatMessage) => void
  /** Retire un message par son ID (ex: rollback d'un envoi en erreur). */
  removeMessage:         (id: string) => void
  markRead:              (convId: string) => void
  setLoadingConvs:       (v: boolean) => void
  setLoadingMsgs:        (v: boolean) => void
  reset:                 () => void
}

export const useMessageStore = create<MessageState>((set) => ({
  conversations:        [],
  activeConversationId: null,
  messages:             {},
  isLoadingConvs:       false,
  isLoadingMsgs:        false,

  setConversations: (convs) => set({ conversations: convs }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (convId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [convId]: msgs } })),

  addMessage: (msg) =>
    set((s) => {
      const existing = s.messages[msg.conversation_id] ?? []
      // Évite les doublons (Realtime peut renvoyer un message déjà ajouté optimistiquement)
      if (existing.some((m) => m.id === msg.id)) return s

      const updated = [...existing, msg]
      const convs = s.conversations.map((c) =>
        c.id === msg.conversation_id
          ? {
              ...c,
              last_message: {
                content:    msg.content,
                created_at: msg.created_at,
                is_mine:    msg.is_mine,
              },
              unread_count: msg.is_mine ? c.unread_count : c.unread_count + 1,
              updated_at:   msg.created_at,
            }
          : c
      )
      return {
        messages:      { ...s.messages, [msg.conversation_id]: updated },
        conversations: convs,
      }
    }),

  replaceMessage: (tempId, msg) =>
    set((s) => {
      const convId  = msg.conversation_id
      const current = s.messages[convId] ?? []
      return {
        messages: {
          ...s.messages,
          [convId]: current.map((m) => (m.id === tempId ? msg : m)),
        },
      }
    }),

  removeMessage: (id) =>
    set((s) => {
      const updated: Record<string, ChatMessage[]> = {}
      for (const [convId, msgs] of Object.entries(s.messages)) {
        updated[convId] = msgs.filter((m) => m.id !== id)
      }
      return { messages: updated }
    }),

  markRead: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId ? { ...c, unread_count: 0 } : c
      ),
    })),

  setLoadingConvs: (v) => set({ isLoadingConvs: v }),
  setLoadingMsgs:  (v) => set({ isLoadingMsgs: v }),
  reset:           ()  => set({ conversations: [], messages: {}, activeConversationId: null }),
}))
