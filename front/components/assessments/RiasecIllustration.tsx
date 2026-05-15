/**
 * RiasecIllustration — illustration pour le test RIASEC (6 profils professionnels).
 */

import { Wrench, Search, Palette, Users, TrendingUp, ClipboardList } from "lucide-react"

const PROFILES = [
  { letter: "R", label: "Réaliste",      Icon: Wrench,        bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  icon: "text-orange-500" },
  { letter: "I", label: "Investigateur", Icon: Search,        bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    icon: "text-blue-500" },
  { letter: "A", label: "Artistique",    Icon: Palette,       bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  icon: "text-purple-500" },
  { letter: "S", label: "Social",        Icon: Users,         bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700",   icon: "text-green-500" },
  { letter: "E", label: "Entreprenant",  Icon: TrendingUp,    bg: "bg-yellow-50",  border: "border-yellow-200",  text: "text-yellow-700",  icon: "text-yellow-500" },
  { letter: "C", label: "Conventionnel", Icon: ClipboardList, bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700",   icon: "text-slate-500" },
] as const

export function RiasecIllustration() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Rangée du haut : R I A */}
      <div className="flex items-center gap-4">
        {PROFILES.slice(0, 3).map(({ letter, label, Icon, bg, border, text, icon }) => (
          <div key={letter} className="flex flex-col items-center gap-2">
            <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl border-2 shadow-sm ${bg} ${border}`}>
              <Icon size={22} className={icon} strokeWidth={1.5} />
              <span className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 text-[9px] font-black ${border} ${text}`}>
                {letter}
              </span>
            </div>
            <span className={`text-[10px] font-semibold tracking-wide ${text}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Rangée du bas : S E C */}
      <div className="flex items-center gap-4">
        {PROFILES.slice(3).map(({ letter, label, Icon, bg, border, text, icon }) => (
          <div key={letter} className="flex flex-col items-center gap-2">
            <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl border-2 shadow-sm ${bg} ${border}`}>
              <Icon size={22} className={icon} strokeWidth={1.5} />
              <span className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 text-[9px] font-black ${border} ${text}`}>
                {letter}
              </span>
            </div>
            <span className={`text-[10px] font-semibold tracking-wide ${text}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
