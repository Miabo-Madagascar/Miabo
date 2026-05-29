/**
 * VakIllustration — illustration pour le test VAK (Visuel, Auditif, Kinesthésique).
 */

import { Eye, Headphones, Hand } from "lucide-react"

const STYLES = [
  {
    label: "Visuel",        letter: "V", Icon: Eye,
    bg: "bg-primary-50",   border: "border-primary-200",
    text: "text-primary-700",   icon: "text-primary-500",
  },
  {
    label: "Auditif",       letter: "A", Icon: Headphones,
    bg: "bg-secondary-50", border: "border-secondary-200",
    text: "text-secondary-700", icon: "text-secondary-500",
  },
  {
    label: "Kinesthésique", letter: "K", Icon: Hand,
    bg: "bg-amber-50",     border: "border-amber-200",
    text: "text-amber-700",     icon: "text-amber-500",
  },
] as const

export function VakIllustration() {
  return (
    <div className="flex items-center justify-center gap-8 py-2">
      {STYLES.map(({ label, letter, Icon, bg, border, text, icon }) => (
        <div key={label} className="flex flex-col items-center gap-3">
          <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 shadow-sm ${bg} ${border}`}>
            <Icon size={32} className={icon} strokeWidth={1.5} />
            <span className={`absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 text-[10px] font-black ${border} ${text}`}>
              {letter}
            </span>
          </div>
          <span className={`text-xs font-semibold tracking-wide ${text}`}>{label}</span>
        </div>
      ))}
    </div>
  )
}
