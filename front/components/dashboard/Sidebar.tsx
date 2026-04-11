"use client"
/**
 * Sidebar — composant de navigation latérale premium.
 * Navigation dynamique basée sur le rôle de l'utilisateur.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  User, 
  Wallet, 
  Search,
  Users,
  ClipboardList
} from "lucide-react"

interface NavItem {
  label:      string
  href:       string
  icon:       any
  roles:      string[]
}

interface SidebarProps {
  locale: string
  role:   string
}

const MENU_ITEMS: NavItem[] = [
  { label: "Dashboard",        href: "",                     icon: BarChart3,     roles: ["student", "tutor", "parent", "admin", "canope", "cosp"] },
  { label: "Trouver Tuteur",  href: "/tuteurs",             icon: Search,        roles: ["student"] },
  { label: "Sessions",         href: "/sessions",            icon: Calendar,      roles: ["student", "tutor", "parent"] },
  { label: "Messages",         href: "/messages",            icon: MessageSquare, roles: ["student", "tutor", "parent", "admin"] },
  { label: "Portefeuille",     href: "/wallet",              icon: Wallet,        roles: ["student", "tutor", "parent"] },
  { label: "Disponibilités", href: "/tuteur/disponibilites", icon: BookOpen,      roles: ["tutor"] },
  { label: "Bilans",           href: "/canope/bilans",       icon: ClipboardList, roles: ["canope", "cosp", "admin"] },
  { label: "Validation Tuteurs", href: "/canope/tuteurs",    icon: Users,         roles: ["canope", "admin"] },
  { label: "Ressources",       href: "/canope/ressources",   icon: BookOpen,      roles: ["canope", "cosp", "student"] },
  { label: "Utilisateurs",     href: "/admin/users",         icon: Users,         roles: ["admin"] },
  { label: "Mon Profil",       href: "/profil",              icon: User,          roles: ["student", "tutor", "parent", "admin", "canope", "cosp"] },
]

export function Sidebar({ locale, role }: SidebarProps) {
  const pathname = usePathname()

  const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-bg-base border-r border-border shadow-sm">
      {/* ── Logo ────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-500)] flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">
            MIABO
          </span>
        </Link>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {filteredItems.map((item) => {
          const fullHref = `/${locale}${item.href || ""}`
          const isActive = pathname === fullHref || (item.href !== "" && pathname.startsWith(fullHref))
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={fullHref}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"}
              `}
            >
              <Icon size={20} className={isActive ? "text-primary-500" : "text-text-muted"} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="p-4 mt-auto">
        <div className="rounded-2xl bg-linear-to-br from-primary to-primary-dark p-4 text-white">
          <p className="text-xs font-medium opacity-80">Besoin d&apos;aide ?</p>
          <p className="text-sm font-semibold mt-0.5">Support MIABO</p>
          <button className="mt-3 w-full bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg py-1.5 text-xs font-bold transition-colors">
            Nous contacter
          </button>
        </div>
      </div>
    </aside>
  )
}
