/**
 * DiscProfileIllustration — compositions SVG géométriques par profil DISC.
 * D = escalier ascendant · I = connexions rayonnantes · S = ondes · C = grille
 */

import { DISC_PROFILES } from "../data/discProfiles"

interface Props {
  type: string
  size?: number
}

export function DiscProfileIllustration({ type, size = 120 }: Props) {
  const p    = DISC_PROFILES[type]
  const tone = p?.tone ?? "#3a6cf8"
  const tint = `${tone}14`
  const w = size, h = size

  if (type === "D") {
    return (
      <svg viewBox="0 0 120 120" width={w} height={h} className="block">
        <rect x="0" y="0" width="120" height="120" rx="20" fill={tint}/>
        <rect x="18" y="78" width="20" height="24" rx="3" fill={tone} opacity=".35"/>
        <rect x="42" y="62" width="20" height="40" rx="3" fill={tone} opacity=".55"/>
        <rect x="66" y="42" width="20" height="60" rx="3" fill={tone} opacity=".8"/>
        <rect x="90" y="22" width="14" height="80" rx="3" fill={tone}/>
        <circle cx="97" cy="14" r="6" fill={tone}/>
      </svg>
    )
  }
  if (type === "I") {
    const satellites: [number, number][] = [
      [28,28],[92,28],[28,92],[92,92],[60,18],[18,60],[102,60],[60,102],
    ]
    return (
      <svg viewBox="0 0 120 120" width={w} height={h} className="block">
        <rect x="0" y="0" width="120" height="120" rx="20" fill={tint}/>
        {satellites.map(([cx,cy], i) => (
          <g key={i}>
            <line x1="60" y1="60" x2={cx} y2={cy} stroke={tone} strokeWidth="1.5" opacity=".25"/>
            <circle cx={cx} cy={cy} r={i < 4 ? 8 : 5} fill={tone} opacity={i < 4 ? .6 : .4}/>
          </g>
        ))}
        <circle cx="60" cy="60" r="14" fill={tone}/>
        <circle cx="60" cy="60" r="22" fill="none" stroke={tone} strokeWidth="1.5" opacity=".35"/>
      </svg>
    )
  }
  if (type === "S") {
    return (
      <svg viewBox="0 0 120 120" width={w} height={h} className="block">
        <rect x="0" y="0" width="120" height="120" rx="20" fill={tint}/>
        {[44, 32, 20, 10].map((r, i) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke={tone}
            strokeWidth="1.5" opacity={0.2 + i * 0.18}/>
        ))}
        <circle cx="60" cy="60" r="10" fill={tone}/>
        <line x1="14" y1="60" x2="106" y2="60" stroke={tone} strokeWidth="1" opacity=".18" strokeDasharray="2 4"/>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 120" width={w} height={h} className="block">
      <rect x="0" y="0" width="120" height="120" rx="20" fill={tint}/>
      {[0,1,2,3].flatMap(r =>
        [0,1,2,3].map(c => {
          const filled = (r + c) % 2 === 0
          return (
            <rect key={`${r}-${c}`}
              x={18 + c * 22} y={18 + r * 22}
              width="16" height="16" rx="3"
              fill={filled ? tone : "transparent"}
              stroke={tone} strokeWidth="1.4"
              opacity={filled ? (0.4 + ((r + c) % 3) * 0.2) : 0.55}/>
          )
        })
      )}
    </svg>
  )
}
