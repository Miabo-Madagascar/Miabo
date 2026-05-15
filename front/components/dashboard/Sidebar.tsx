"use client"
/**
 * Sidebar — navigation latérale avec mode réduit (collapsed).
 * - Sticky : ne suit pas le scroll horizontal (géré par le layout h-screen)
 * - Collapsible : bouton toggle + persistence localStorage
 */

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart3, BookOpen, Calendar, MessageSquare, User, Wallet,
  Search, Users, ClipboardList, ChevronLeft, ChevronRight,
  type LucideIcon,
} from "lucide-react"

interface NavItem { label: string; href: string; icon: LucideIcon; roles: string[] }
interface SidebarProps { locale: string; role: string }

const ROLE_ROOT: Record<string, string> = {
  student: "/eleve",
  tutor:   "/tuteur",
  parent:  "/parent",
  admin:   "/admin",
  canope:  "/canope",
  cosp:    "/cosp",
}

const MENU_ITEMS: NavItem[] = [
  { label: "Dashboard",          href: "",                        icon: BarChart3,     roles: ["student", "tutor", "parent", "admin", "canope", "cosp"] },
  { label: "Trouver Tuteur",     href: "/tuteurs",                icon: Search,        roles: ["student"] },
  { label: "Sessions",           href: "/sessions",               icon: Calendar,      roles: ["student", "tutor", "parent"] },
  { label: "Messages",           href: "/messages",               icon: MessageSquare, roles: ["student", "tutor", "parent", "admin"] },
  { label: "Portefeuille",       href: "/wallet",                 icon: Wallet,        roles: ["student", "tutor", "parent"] },
  { label: "Disponibilités",     href: "/tuteur/disponibilites",  icon: BookOpen,      roles: ["tutor"] },
  { label: "Bilans",             href: "/canope/bilans",          icon: ClipboardList, roles: ["canope", "admin"] },
  { label: "Bilans",             href: "/cosp/bilans",            icon: ClipboardList, roles: ["cosp"] },
  { label: "Validation Tuteurs", href: "/canope/tuteurs",         icon: Users,         roles: ["canope", "admin"] },
  { label: "Ressources",         href: "/canope/ressources",      icon: BookOpen,      roles: ["canope", "student"] },
  { label: "Ressources",         href: "/cosp/ressources",        icon: BookOpen,      roles: ["cosp"] },
  { label: "Utilisateurs",       href: "/admin",                  icon: Users,         roles: ["admin"] },
  { label: "Mon Profil",         href: "/profil",                 icon: User,          roles: ["student", "tutor", "parent", "admin", "canope", "cosp"] },
]

const LS_KEY = "miabo_sidebar_collapsed"

export function Sidebar({ locale, role }: SidebarProps) {
  const pathname  = usePathname()
  // Initialisation lazy — lit localStorage une seule fois, sans useEffect
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(LS_KEY) === "true"
  })

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(LS_KEY, String(next))
      return next
    })
  }

  const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(role))

  return (
    <aside
      className={[
        "relative flex shrink-0 flex-col bg-bg-base border-r border-border shadow-sm",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      {/* ── Logo + bouton toggle ──────────────────────────────── */}
      <div className={[
        "flex h-16 shrink-0 items-center border-b border-border",
        collapsed ? "justify-center items-center" : "justify-between px-3",
      ].join(" ")}>
        <Link href={`/${locale}`} className="flex shrink-0 justify-center items-center overflow-hidden">
          {collapsed ? (
            /* Icône seule en mode réduit — taille généreuse pour remplir le rail */
            <Image src="/miabo-icon.svg" alt="MIABO" width={36} height={36} className="h-9 w-9 shrink-0" />
          ) : (
            /* Logo complet en mode développé */
            <Image src="/logo.png" alt="MIABO Madagascar" width={180} height={40} priority />
          )}
        </Link>

        {/* Bouton toggle — icône seule, style ChatGPT */}
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Développer" : "Réduire"}
          className="flex h-3 w-3 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-1">
        {filteredItems.map((item) => {
          const resolved = item.href === "" ? (ROLE_ROOT[role] ?? "") : item.href
          const fullHref = `/${locale}${resolved}`
          const isActive = pathname === fullHref || (resolved !== "" && pathname.startsWith(fullHref))
          const Icon     = item.icon

          return (
            <Link
              key={item.label + item.href}
              href={fullHref}
              title={collapsed ? item.label : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
              ].join(" ")}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? "text-primary-500" : "text-text-muted"}`} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer support ────────────────────────────────────── */}
      {!collapsed && (
        <div className="shrink-0 p-3">
          <div className="rounded-2xl bg-linear-to-br from-primary to-primary-dark p-4 text-white">
            <p className="text-xs font-medium opacity-80">Besoin d&apos;aide ?</p>
            <p className="text-sm font-semibold mt-0.5">Support MIABO</p>
            <button className="mt-3 w-full bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg py-1.5 text-xs font-bold transition-colors">
              Nous contacter
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
