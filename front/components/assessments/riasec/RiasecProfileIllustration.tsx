/**
 * Illustrations SVG abstraites par profil RIASEC (Holland).
 * R = rouage · I = orbites atomiques · A = splash créatif
 * S = trio social · E = barres ascendantes · C = colonnes ordonnées
 */

import { RIASEC_PROFILES } from "../data/riasecProfiles"

interface Props { type: string; size?: number }

export function RiasecProfileIllustration({ type, size = 120 }: Props) {
  const p    = RIASEC_PROFILES[type]
  const tone = p?.tone ?? "#1e40af"
  const tint = `${tone}14`

  const Frame = ({ children }: { children: React.ReactNode }) => (
    <svg viewBox="0 0 120 120" width={size} height={size} className="block">
      <rect x="0" y="0" width="120" height="120" rx="20" fill={tint} />
      {children}
    </svg>
  )

  if (type === "R") return (
    <Frame>
      <g transform="translate(60 60)">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 8
          const x = Math.cos(a) * 38, y = Math.sin(a) * 38
          return <rect key={i} x={x - 5} y={y - 8} width="10" height="16" rx="2"
            fill={tone} opacity=".75" transform={`rotate(${i * 45} ${x} ${y})`} />
        })}
      </g>
      <circle cx="60" cy="60" r="22" fill={tone} />
      <circle cx="60" cy="60" r="8"  fill="#fff" opacity=".9" />
    </Frame>
  )

  if (type === "I") return (
    <Frame>
      <ellipse cx="60" cy="60" rx="42" ry="16" fill="none" stroke={tone} strokeWidth="1.5" opacity=".55" />
      <ellipse cx="60" cy="60" rx="42" ry="16" fill="none" stroke={tone} strokeWidth="1.5" opacity=".55" transform="rotate(60 60 60)" />
      <ellipse cx="60" cy="60" rx="42" ry="16" fill="none" stroke={tone} strokeWidth="1.5" opacity=".55" transform="rotate(-60 60 60)" />
      <circle cx="60"  cy="60" r="9" fill={tone} />
      <circle cx="102" cy="60" r="4" fill={tone} opacity=".8" />
      <circle cx="39"  cy="96" r="4" fill={tone} opacity=".8" />
      <circle cx="39"  cy="24" r="4" fill={tone} opacity=".8" />
    </Frame>
  )

  if (type === "A") return (
    <Frame>
      <circle cx="40" cy="44" r="18" fill={tone} opacity=".55" />
      <circle cx="76" cy="38" r="12" fill={tone} opacity=".75" />
      <circle cx="86" cy="68" r="20" fill={tone} opacity=".4" />
      <circle cx="48" cy="80" r="14" fill={tone} />
      <circle cx="68" cy="60" r="6"  fill="#fff" opacity=".85" />
      <circle cx="32" cy="68" r="4"  fill={tone} opacity=".7" />
      <circle cx="92" cy="42" r="3"  fill={tone} opacity=".7" />
    </Frame>
  )

  if (type === "S") {
    const pts: [number, number][] = [[60, 30], [30, 84], [90, 84]]
    return (
      <Frame>
        {pts.map((a, i) => pts.slice(i + 1).map((b, j) => (
          <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
            stroke={tone} strokeWidth="1.5" opacity=".35" />
        )))}
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x}      cy={y - 8} r="7"  fill={tone} />
            <rect   x={x - 10} y={y - 1}  width="20" height="14" rx="6" fill={tone} opacity=".75" />
          </g>
        ))}
      </Frame>
    )
  }

  if (type === "E") return (
    <Frame>
      <rect x="22" y="76" width="22" height="26" rx="3" fill={tone} opacity=".35" />
      <rect x="50" y="60" width="22" height="42" rx="3" fill={tone} opacity=".55" />
      <rect x="78" y="44" width="22" height="58" rx="3" fill={tone} opacity=".8" />
      <path d="M22 92 L100 22" stroke={tone} strokeWidth="3" strokeLinecap="round" />
      <path d="M100 22 L86 22 M100 22 L100 36" stroke={tone} strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="22" r="6" fill={tone} />
    </Frame>
  )

  /* C — Conventionnel : colonnes ordonnées */
  return (
    <Frame>
      <line x1="18" y1="92" x2="102" y2="92" stroke={tone} strokeWidth="1.5" opacity=".5" />
      {([[24,60],[38,44],[52,52],[66,36],[80,48],[94,28]] as [number,number][]).map(([x,top],i) => (
        <rect key={i} x={x - 5} y={top} width="10" height={92 - top} rx="2"
          fill={tone} opacity={0.45 + i * 0.08} />
      ))}
      <line x1="18" y1="68" x2="102" y2="68" stroke={tone} strokeWidth="0.8" opacity=".25" strokeDasharray="2 4" />
    </Frame>
  )
}
