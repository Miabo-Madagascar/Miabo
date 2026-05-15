/**
 * DiscIllustration — illustration pour le test DISC (4 profils comportementaux).
 */

import { Zap, Smile, Shield, CheckSquare } from "lucide-react"

const QUADRANTS = [
  { letter: "D", label: "Dominance",   Icon: Zap,         bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     icon: "text-red-500" },
  { letter: "I", label: "Influence",   Icon: Smile,       bg: "bg-yellow-50",  border: "border-yellow-200",  text: "text-yellow-700",  icon: "text-yellow-500" },
  { letter: "S", label: "Stabilité",   Icon: Shield,      bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700",   icon: "text-green-500" },
  { letter: "C", label: "Conformité",  Icon: CheckSquare, bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-700", icon: "text-primary-500" },
] as const

export function DiscIllustration() {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* Grille 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map(({ letter, label, Icon, bg, border, text, icon }) => (
          <div key={letter} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm ${bg} ${border}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm`}>
              <Icon size={20} className={icon} strokeWidth={1.5} />
            </div>
            <div>
              <p className={`text-sm font-black ${text}`}>{letter}</p>
              <p className={`text-[10px] font-medium ${text} opacity-80`}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
