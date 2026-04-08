"use client"
/**
 * NotificationBell — Affichage en temps réel des notifications (Supabase)
 */

import { useState, useEffect, useRef } from "react"
import { Bell, Check, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api/client"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  link?: string
  is_read: boolean
  created_at: string
}

export function NotificationBell({ locale }: { locale: string }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch initial
  useEffect(() => {
    if (!user?.id) return
    
    const fetchNotifs = async () => {
      try {
        const data = await api.get<Notification[]>("/notifications/")
        setNotifications(data)
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
      }
    }
    fetchNotifs()
  }, [user?.id])

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return
    const supabase = createClient()
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read/all")
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return
    try {
      await api.post("/notifications/read", { notification_ids: [id] })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-bg-muted transition-colors text-text-secondary hover:text-text-primary"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white ring-2 ring-bg-base">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-bg-base shadow-lg z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b border-border bg-bg-subtle">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
              >
                <Check size={14} /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted">
                Aucune notification pour le moment.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id, notif.is_read)}
                    className={`p-4 hover:bg-bg-muted transition-colors cursor-pointer group ${
                      !notif.is_read ? "bg-primary-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {!notif.is_read && (
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.is_read ? "font-semibold text-text-primary" : "text-text-secondary font-medium"}`}>
                          {notif.title}
                        </p>
                        {notif.body && (
                          <p className="mt-1 text-xs text-text-muted line-clamp-2">
                            {notif.body}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-text-muted">
                            {new Date(notif.created_at).toLocaleDateString(locale, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {notif.link && (
                            <Link
                              href={`/${locale}${notif.link}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 text-xs flex items-center gap-1 hover:underline"
                            >
                              Voir <ExternalLink size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
