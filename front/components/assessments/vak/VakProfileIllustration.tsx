/**
 * Illustrations SVG abstraites par profil VAK.
 * V = trois disques en lentille · A = arcs sonores · K = carrés en rotation
 */

import { VAK_PROFILES } from "../data/vakProfiles"

interface Props {
  type: string
  size?: number
}

export function VakProfileIllustration({ type, size = 120 }: Props) {
  const p    = VAK_PROFILES[type]
  const tone = p?.tone ?? "#7c3aed"
  const tint = `${tone}14`
  const w = size, h = size

  const Frame = ({ children }: { children: React.ReactNode }) => (
    <svg viewBox="0 0 120 120" width={w} height={h} className="block">
      <rect x="0" y="0" width="120" height="120" rx="20" fill={tint} />
      {children}
    </svg>
  )

  if (type === "V") {
    // Visuel — trois disques translucides superposés (mode « lentille »)
    return (
      <Frame>
        <circle cx="44" cy="50" r="28" fill={tone} opacity=".35" />
        <circle cx="76" cy="50" r="28" fill={tone} opacity=".45" />
        <circle cx="60" cy="78" r="28" fill={tone} opacity=".55" />
        <circle cx="60" cy="60" r="6"  fill="#fff" opacity=".9" />
        <circle cx="60" cy="60" r="9"  fill="none" stroke={tone} strokeWidth="1.5" opacity=".6" />
      </Frame>
    )
  }

  if (type === "A") {
    // Auditif — arcs concentriques rayonnant depuis la gauche (ondes sonores)
    return (
      <Frame>
        {([16, 30, 44, 58] as const).map((r, i) => (
          <path key={r}
            d={`M 30 ${60 - r} A ${r} ${r} 0 0 1 30 ${60 + r}`}
            fill="none" stroke={tone} strokeWidth="2"
            strokeLinecap="round" opacity={0.85 - i * 0.18} />
        ))}
        <circle cx="30" cy="60" r="8" fill={tone} />
        <circle cx="98" cy="38" r="2.5" fill={tone} opacity=".5" />
        <circle cx="104" cy="60" r="3"   fill={tone} opacity=".7" />
        <circle cx="98" cy="82" r="2.5" fill={tone} opacity=".5" />
      </Frame>
    )
  }

  // K — Kinesthésique : carrés décalés en rotation suggérant le mouvement
  return (
    <Frame>
      <g transform="rotate(-8 60 60)" opacity=".25">
        <rect x="22" y="42" width="36" height="36" rx="6" fill={tone} />
      </g>
      <g transform="rotate(4 60 60)" opacity=".5">
        <rect x="38" y="42" width="36" height="36" rx="6" fill={tone} />
      </g>
      <g transform="rotate(14 60 60)">
        <rect x="54" y="42" width="36" height="36" rx="6" fill={tone} />
      </g>
      {/* flèches de mouvement */}
      <path d="M16 30 L26 30 M16 30 L20 26 M16 30 L20 34"
        stroke={tone} strokeWidth="1.5" opacity=".55" strokeLinecap="round" fill="none" />
      <path d="M94 92 L104 92 M104 92 L100 88 M104 92 L100 96"
        stroke={tone} strokeWidth="1.5" opacity=".55" strokeLinecap="round" fill="none" />
    </Frame>
  )
}
