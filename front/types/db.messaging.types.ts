/**
 * Types BDD — domaine Messagerie & Notifications.
 * Tables : Conversation, ConversationParticipant, Message,
 *          MessageRead, MessageReaction, Notification
 */

import type { AllowedEmoji, ConversationType, MessageType, NotificationType } from "./enums"

/** Fil de discussion entre utilisateurs */
export interface Conversation {
  id:         string
  type:       ConversationType
  session_id: string | null
  created_at: string
  updated_at: string
}

/** Participant d'une conversation — PK composite */
export interface ConversationParticipant {
  conversation_id: string
  user_id:         string
  joined_at:       string
}

/** Message individuel — soft delete via is_deleted */
export interface Message {
  id:              string
  conversation_id: string
  sender_id:       string
  content:         string
  message_type:    MessageType
  file_url:        string | null
  is_deleted:      boolean
  created_at:      string
}

/** Accusé de lecture multi-utilisateurs — PK composite */
export interface MessageRead {
  message_id: string
  user_id:    string
  read_at:    string
}

/** Réaction emoji — PK composite (message_id, user_id, emoji) */
export interface MessageReaction {
  message_id: string
  user_id:    string
  emoji:      AllowedEmoji
  created_at: string
}

/** Notification in-app — conservée 30 jours */
export interface Notification {
  id:         string
  user_id:    string
  type:       NotificationType
  title:      string
  body:       string | null
  link:       string | null           // URL relative ex: /dashboard/sessions/uuid
  is_read:    boolean
  created_at: string
}
