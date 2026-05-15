interface Props { testId: "vak" | "riasec" | "disc" }

export function BilanHeroIllustration({ testId }: Props) {
  if (testId === "vak") return <VakHero />
  if (testId === "riasec") return (
    <PhotoHero
      photo="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=720&q=80&fit=crop&auto=format"
      letters={["R","I","A","S","E","C"]}
      names={["Réaliste","Investigateur","Artistique","Social","Entreprenant","Conventionnel"]}
      colors={["#a16207","#1e40af","#be185d","#15803d","#b91c1c","#475569"]}
      accent="#1e40af"
      caption="Six chemins · une orientation"
    />
  )
  return (
    <PhotoHero
      photo="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=720&q=80&fit=crop&auto=format"
      letters={["D","I","S","C"]}
      names={["Dominance","Influence","Stabilité","Conformité"]}
      colors={["#dc2626","#d97706","#16a34a","#2450ed"]}
      accent="#dc2626"
      caption="Quatre styles · une personnalité"
    />
  )
}

function VakHero() {
  return (
    <svg viewBox="0 0 320 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vakBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.08"/>
          <stop offset="50%"  stopColor="#0891b2" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.10"/>
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#vakBg)"/>

      {/* V — Visuel (violet) */}
      <g transform="translate(80 80)">
        <circle cx="-12" cy="-8" r="22" fill="#7c3aed" opacity=".35"/>
        <circle cx="12"  cy="-8" r="22" fill="#7c3aed" opacity=".45"/>
        <circle cx="0"   cy="12" r="22" fill="#7c3aed" opacity=".55"/>
        <circle cx="0"   cy="0"  r="5"  fill="#fff"    opacity=".9"/>
      </g>

      {/* A — Auditif (cyan) */}
      <g transform="translate(160 80)" stroke="#0891b2" fill="none" strokeWidth="2.2" strokeLinecap="round">
        <path d="M -22 -18 A 22 22 0 0 1 -22 18" opacity=".85"/>
        <path d="M -10 -28 A 32 32 0 0 1 -10 28" opacity=".65"/>
        <path d="M 4 -38 A 42 42 0 0 1 4 38"     opacity=".45"/>
      </g>
      <circle cx="138" cy="80" r="6"   fill="#0891b2"/>
      <circle cx="208" cy="64" r="2.5" fill="#0891b2" opacity=".6"/>
      <circle cx="212" cy="80" r="3"   fill="#0891b2" opacity=".75"/>
      <circle cx="208" cy="96" r="2.5" fill="#0891b2" opacity=".6"/>

      {/* K — Kinesthésique (orange) */}
      <g transform="translate(245 80)">
        <g transform="rotate(-10)" opacity=".3"><rect x="-22" y="-22" width="44" height="44" rx="6" fill="#ea580c"/></g>
        <g transform="rotate(4)"   opacity=".55"><rect x="-22" y="-22" width="44" height="44" rx="6" fill="#ea580c"/></g>
        <g transform="rotate(18)"><rect x="-22" y="-22" width="44" height="44" rx="6" fill="#ea580c"/></g>
      </g>
    </svg>
  )
}

interface PhotoHeroProps {
  photo: string; letters: string[]; names: string[]
  colors: string[]; accent: string; caption: string
}

function PhotoHero({ photo, letters, names, colors, accent, caption }: PhotoHeroProps) {
  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy"/>
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${accent}40 0%, ${accent}18 30%, rgba(15,23,42,.06) 55%, rgba(255,255,255,.92) 92%, #fff 100%)` }}/>
      <div className="absolute top-3 left-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-700 border border-white/60 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }}/>
          {caption}
        </span>
      </div>
      <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-1.5">
        {letters.map((l, i) => (
          <span key={l} title={names[i]}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold backdrop-blur-md border"
            style={{ background: "rgba(255,255,255,0.96)", color: colors[i], borderColor: `${colors[i]}30`, boxShadow: `0 2px 8px ${colors[i]}22` }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
