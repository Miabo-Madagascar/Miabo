"use client"
/**
 * Panneau gauche des pages d'authentification.
 * Images hero en fondu automatique + branding MIABO + stats clés.
 */

import { useState, useEffect } from "react"
import Image from "next/image"

interface HeroImage {
  src: string
  alt: string
}

const IMAGES: HeroImage[] = [
  { src: "/hero-slide-1.jpg", alt: "Élève malgache concentré sur ses études" },
  { src: "/hero-slide-2.jpg", alt: "Tuteur accompagnant un élève sur ordinateur" },
  { src: "/hero-slide-3.jpg", alt: "Diplômés célébrant leur réussite" },
]

const STATS = [
  { value: "500+",  label: "Tuteurs certifiés CANOPE" },
  { value: "2 500", label: "Élèves accompagnés" },
  { value: "FR/MG", label: "Plateforme bilingue" },
]

const TRANSITION_MS = 500
const INTERVAL_MS   = 4500

export default function AuthPanel() {
  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)

  /* Rotation automatique des images */
  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(i => (i + 1) % IMAGES.length)
        setFading(false)
      }, TRANSITION_MS)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full bg-[#1e3aec] overflow-hidden p-12">

      {/* Couche image en fondu */}
      <div
        className="absolute inset-0"
        style={{ opacity: fading ? 0 : 1, transition: `opacity ${TRANSITION_MS}ms ease` }}
      >
        <Image
          src={IMAGES[current].src}
          alt={IMAGES[current].alt}
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay couleur brand */}
        <div className="absolute inset-0 bg-[#1e3aec]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      {/* Logo haut */}
      <div className="relative z-10">
        <div className="bg-white rounded-sm px-3 py-2 inline-block shadow-lg">
          <Image src="/logo.png" alt="MIABO" width={100} height={40} className="h-8 w-auto" />
        </div>
      </div>

      {/* Contenu bas */}
      <div className="relative z-10 space-y-8">
        <p className="text-white font-black text-[40px] leading-[1.05] tracking-tight">
          La plateforme de<br />tutorat bilingue<br />de Madagascar
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          {STATS.map(stat => (
            <div key={stat.value}>
              <div className="text-white font-black text-2xl">{stat.value}</div>
              <div className="text-white/60 text-xs font-bold mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Indicateurs de slide */}
        <div className="flex gap-2">
          {IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
