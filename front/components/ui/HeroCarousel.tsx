"use client"

/**
 * Carousel hero MIABO — transition en fondu synchronisée texte + image.
 * Chaque slide alterne titre, sous-titre, CTA et photo masquée par clip-path.
 */

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  title: [string, string]
  subtitle: string
  cta: string
  ctaHref: string
  image: string
  imageAlt: string
}

const SLIDES: Slide[] = [
  {
    title: ["Réussite", "Sans Limites"],
    subtitle: "Le tutorat bilingue qui propulse les futurs leaders de Madagascar vers l\u2019excellence.",
    cta: "Démarrer ici",
    ctaHref: "/auth/register",
    image: "/hero-slide-1.jpg",
    imageAlt: "Élève malgache concentré sur ses études",
  },
  {
    title: ["Tuteurs", "Certifiés SESAME"],
    subtitle: "Des enseignants certifiés, spécialisés dans l\u2019accompagnement personnalisé de chaque élève.",
    cta: "Devenir tuteur",
    ctaHref: "/auth/register?role=tutor",
    image: "/hero-slide-2.jpg",
    imageAlt: "Tuteur accompagnant un élève sur ordinateur",
  },
  {
    title: ["Trouvez", "Votre Voie"],
    subtitle: "Tests d\u2019orientation VAK, RIASEC et DISC pour découvrir vos talents et bâtir votre avenir.",
    cta: "Passer un bilan",
    ctaHref: "/auth/register",
    image: "/hero-slide-3.jpg",
    imageAlt: "Diplômés célébrant leur réussite",
  },
]

const TRANSITION_MS = 400
const INTERVAL_MS = 5500

interface HeroCarouselProps {
  locale: string
}

export default function HeroCarousel({ locale }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  /* Fondu-sortie → mise à jour du slide → fondu-entrée */
  const goTo = useCallback((index: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
    }, TRANSITION_MS)
  }, [])

  /* Avance automatique */
  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % SLIDES.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [current, goTo])

  const slide = SLIDES[current]

  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 px-10 bg-[#1e3aec] noise-bg overflow-hidden text-white">
      <div className="hero-circuit-pattern opacity-10" />

      {/* Conteneur principal — opacité pilotée par `fading` */}
      <div
        className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full"
        style={{ opacity: fading ? 0 : 1, transition: `opacity ${TRANSITION_MS}ms ease` }}
      >
        {/* ── Contenu textuel ────────────────────────────────────────────── */}
        <div className="max-w-2xl mt-12">
          <h1 className="font-bold-title text-[72px] md:text-[100px] mb-6 tracking-tighter leading-[0.9]">
            {slide.title[0]}<br />{slide.title[1]}
          </h1>
          <p className="text-xl md:text-2xl mb-10 leading-relaxed font-bold opacity-90 max-w-lg">
            {slide.subtitle}
          </p>
          <Link
            href={`/${locale}${slide.ctaHref}`}
            className="btn-brushed bg-[#000033] text-white px-10 py-4 text-lg rounded-xl hover:bg-white hover:text-black shadow-xl inline-flex items-center gap-3"
          >
            {slide.cta} <ArrowRight size={18} />
          </Link>

          {/* Indicateurs de slide */}
          <div className="flex gap-2 mt-16">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-white opacity-100" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Image masquée par polygone asymétrique (clip-path) ─────────── */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="hero-cyan-shape transform -translate-x-12 translate-y-24 hidden lg:block" />

          <div
            className="relative z-10 max-w-130 w-full shadow-2xl"
            style={{ clipPath: "polygon(0 0, 88% 0, 100% 8%, 100% 100%, 12% 100%, 0 92%)" }}
          >
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Flèches de navigation */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
            <button
              onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Slide précédent"
              className="bg-white/10 hover:bg-white hover:text-[#1e3aec] text-white rounded-full p-2.5 transition-all backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goTo((current + 1) % SLIDES.length)}
              aria-label="Slide suivant"
              className="bg-white/10 hover:bg-white hover:text-[#1e3aec] text-white rounded-full p-2.5 transition-all backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="absolute top-0 right-0 w-112.5 h-112.5 bg-black/20 -z-10 translate-x-12 -translate-y-12 hero-circuit-pattern" />
        </div>
      </div>
    </section>
  )
}
