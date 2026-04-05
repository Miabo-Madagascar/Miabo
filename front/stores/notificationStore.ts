/**
 * Store notifications — état global du centre de notifications.
 * Alimenté par Supabase Realtime (INSERT sur table notifications).
 */

import type { Notification } from "@/types"

export interface NotificationStore {
  notifications: Notification[]
  unread_count:  number

  // Actions
  addNotification:   (n: Notification) => void
  markAllRead:       () => void
  markRead:          (ids: string[]) => void
  reset:             () => void
}

// TODO : implémenter avec Zustand
// import { create } from "zustand"
// export const useNotificationStore = create<NotificationStore>((set) => ({ ... }))
