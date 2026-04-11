/**
 * Store notifications — badges non lus, notifications in-app.
 * Alimenté par Supabase Realtime (INSERT sur table notifications).
 */

import { create } from "zustand"

export interface AppNotification {
  id:         string
  type:       string
  title:      string
  body:       string | null
  link:       string | null
  is_read:    boolean
  created_at: string
}

interface NotificationState {
  notifications: AppNotification[]
  unread_count:  number

  setNotifications:  (notifs: AppNotification[]) => void
  addNotification:   (n: AppNotification) => void
  markRead:          (ids: string[]) => void
  markAllRead:       () => void
  reset:             () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unread_count:  0,

  setNotifications: (notifs) =>
    set({
      notifications: notifs,
      unread_count:  notifs.filter((n) => !n.is_read).length,
    }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unread_count:  s.unread_count + (n.is_read ? 0 : 1),
    })),

  markRead: (ids) =>
    set((s) => {
      const idSet = new Set(ids)
      const notifications = s.notifications.map((n) =>
        idSet.has(n.id) ? { ...n, is_read: true } : n
      )
      return { notifications, unread_count: notifications.filter((n) => !n.is_read).length }
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unread_count:  0,
    })),

  reset: () => set({ notifications: [], unread_count: 0 }),
}))
