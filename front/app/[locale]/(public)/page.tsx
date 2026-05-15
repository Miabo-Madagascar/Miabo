/**
 * Page d'accueil MIABO — Design "TGR Learning Lab" fidèle.
 * Intègre les motifs exacts de la capture Capture d’écran du 2026-04-14 00-58-00.png
 */

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  User
} from "lucide-react"
import HeroCarousel from "@/components/ui/HeroCarousel"

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  
  return (
    <div className="landing-container flex flex-col min-h-screen font-sans selection:bg-yellow-300 selection:text-black">
      
      {/* ── Skip to content (Comme sur la capture) ────────────────────── */}
      <button className="sr-only focus:not-sr-only fixed top-4 left-4 z-[100] bg-white text-black px-4 py-2 font-bold shadow-lg">
        Skip to content
      </button>

      {/* ── Navbar (TGR Style) ────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-8 bg-transparent text-white">
        <div className="flex items-center gap-12">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-sm">
               <Image src="/logo.png" alt="MIABO" width={110} height={45} className="h-9 w-auto object-contain" />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-bold uppercase tracking-wider">
            <Link href="#" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
              À Propos <ChevronDown size={14} className="opacity-60" />
            </Link>
            <Link href="#services" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
              Services <ChevronDown size={14} className="opacity-60" />
            </Link>
            <Link href="#" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
              Programmes <ChevronDown size={14} className="opacity-60" />
            </Link>
            <Link href="#" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
              S&apos;engager <ChevronDown size={14} className="opacity-60" />
            </Link>
            <Link href="#" className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
              Actualités <ChevronDown size={14} className="opacity-60" />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Link href={`/${locale}/auth/login`} className="flex items-center gap-2 text-[14px] font-bold hover:text-yellow-300 transition-colors">
            <User size={18} className="text-white" /> Se Connecter <ChevronDown size={12} className="opacity-60" />
          </Link>
          <Link 
            href={`/${locale}/auth/register`} 
            className="bg-[#1e1b4b] text-white px-8 py-2.5 rounded-full text-[14px] font-bold hover:bg-white hover:text-black transition-all shadow-lg"
          >
            S&apos;Inscrire
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <HeroCarousel locale={locale} />

      {/* ── START YOUR JOURNEY (White section from Capture 00-58-15) ───── */}
      <section className="py-24 px-10 bg-white text-[#1e1b4b]">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-12">
            <div className="max-w-3xl">
              <h2 className="font-bold-title text-6xl md:text-7xl mb-8 text-[#1e1b4b]">
                Commencez<br />Votre Voyage Ici
              </h2>
              <p className="text-xl md:text-2xl font-bold leading-relaxed opacity-80 decoration-cyan-400 underline-offset-8">
                À travers des programmes certifiés CANOPE proposés toute l&apos;année, les élèves et leurs tuteurs sont accompagnés sur le chemin de l&apos;école à la carrière.
              </p>
            </div>
            
            {/* Upcoming Event style banner (Capture 00-58-15) */}
            <div className="w-full lg:w-[450px]">
              <div className="bg-[#1e1b4b] text-white p-5 rounded-t-xl flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-sm">PROCHAIN ÉVÉNEMENT</span>
                <Link href="#" className="flex items-center gap-1 text-xs font-bold border-b border-white hover:text-cyan-400 transition-colors">
                  <Calendar size={12} /> Voir calendrier
                </Link>
              </div>
              <div className="bg-neutral-50 p-8 border-x border-b border-neutral-200 rounded-b-xl shadow-xl flex gap-6 items-start">
                 <div className="flex flex-col bg-[#3b82f6] text-white text-center rounded-lg overflow-hidden min-w-[70px]">
                    <span className="text-[10px] font-bold py-1 bg-black/10">AVR</span>
                    <span className="text-2xl font-black py-2">15</span>
                 </div>
                 <div>
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wide">ORIENTATION</span>
                    <h3 className="text-xl font-black mt-1 leading-tight">Bilans RIASEC : Trouvez votre voie professionnelle</h3>
                    <p className="text-sm mt-3 opacity-70 font-bold flex items-center gap-2">
                       <Calendar size={14} /> 15 Avr 14:00 - 15 Avr 17:00
                    </p>
                    <button className="mt-6 bg-[#3b82f6] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all">
                       S&apos;INSCRIRE ICI
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS SERVICES (Redesign photo-cards inspiré TGR) ─────────────── */}
      <section id="services" className="py-24 px-10 bg-white">
        <div className="container mx-auto">

          {/* En-tête centré */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-bold-title text-5xl md:text-[72px] mb-6 text-[#1e1b4b]">
              Comment MIABO Crée<br />un Impact Durable
            </h2>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
              Nous développons des programmes qui éveillent la curiosité, renforcent la confiance
              et propulsent les élèves malgaches vers l&apos;excellence.{' '}
              <Link href={`/${locale}/auth/register`} className="text-[#1e3aec] font-bold underline underline-offset-4 hover:text-black transition-colors">
                Rejoindre MIABO
              </Link>
            </p>
          </div>

          {/* Grille 3 cartes photo overlay violet */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1 — Tutorat Certifié */}
            <Link href={`/${locale}/auth/register?role=student`} className="group relative overflow-hidden rounded-2xl aspect-[4/3] block">
              <Image
                src="/student-hero.png"
                alt="Tutorat certifié CANOPE"
                fill
                className="object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#3a1fa8]/75 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <div className="w-8 h-[3px] bg-white/60 mb-5 group-hover:w-14 transition-all duration-500" />
                <h3 className="text-white font-black text-[28px] uppercase leading-[1.1] tracking-tight">
                  Tutorat<br />Certifié CANOPE
                </h3>
                <div className="mt-4 flex items-center gap-2 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight size={15} />
                  <span className="text-xs font-black uppercase tracking-widest">En savoir plus</span>
                </div>
              </div>
            </Link>

            {/* Card 2 — Bilans d'Orientation */}
            <Link href={`/${locale}/auth/register?role=student`} className="group relative overflow-hidden rounded-2xl aspect-[4/3] block">
              <Image
                src="/tutor-section.png"
                alt="Bilans d'orientation COSP"
                fill
                className="object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#5b21b6]/80 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <div className="w-8 h-[3px] bg-white/60 mb-5 group-hover:w-14 transition-all duration-500" />
                <h3 className="text-white font-black text-[28px] uppercase leading-[1.1] tracking-tight">
                  Bilans &amp;<br />Orientation COSP
                </h3>
                <div className="mt-4 flex items-center gap-2 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight size={15} />
                  <span className="text-xs font-black uppercase tracking-widest">En savoir plus</span>
                </div>
              </div>
            </Link>

            {/* Card 3 — Ressources & Paiement (fond CSS abstrait) */}
            <Link href={`/${locale}/auth/register`} className="group relative overflow-hidden rounded-2xl aspect-[4/3] block bg-gradient-to-br from-[#1e3aec] via-[#3b28c0] to-[#1e1b4b]">
              {/* Formes décoratives simulant un fond photo */}
              <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/5" />
              <div className="absolute bottom-16 right-6 w-36 h-36 rounded-full bg-cyan-400/10" />
              <div className="absolute top-14 left-4 w-24 h-24 rounded-full bg-purple-300/10" />
              <div className="absolute top-0 left-0 right-0 bottom-0 service-card-grid-pattern opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <div className="w-8 h-[3px] bg-white/60 mb-5 group-hover:w-14 transition-all duration-500" />
                <h3 className="text-white font-black text-[28px] uppercase leading-[1.1] tracking-tight">
                  Ressources &amp;<br />Paiement Sécurisé
                </h3>
                <div className="mt-4 flex items-center gap-2 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight size={15} />
                  <span className="text-xs font-black uppercase tracking-widest">En savoir plus</span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── FOR STUDENTS (Pink) ────────────────────────────────────────── */}
      <section className="py-24 px-10 section-pink noise-bg relative">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1 relative">
              <div className="brushed-frame p-4 bg-white shadow-2xl rotate-2 hover:rotate-0 transition-transform">
                <Image 
                  src="/tutor-section.png" 
                  alt="Educators" 
                  width={600} 
                  height={600} 
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative Arrow like in capture 00-58-15 */}
              <div className="absolute -top-12 right-0 text-cyan-400 font-bold text-6xl transform -scale-x-100 rotate-12 hidden lg:block">
                 ⤿
              </div>
           </div>
           <div className="order-1 lg:order-2">
              <h2 className="font-bold-title text-[80px] md:text-[110px] mb-8">
                Pour les <span className="text-white bg-black px-6 inline-block -rotate-1">Élèves</span>
              </h2>
              <p className="text-2xl mb-12 leading-relaxed font-bold max-w-lg">
                Découvrez de nouveaux intérêts. Explorez vos passions. 
                Appropriez-vous votre avenir. Tout commence ici !
              </p>
              <Link href="#" className="btn-brushed bg-white text-black px-10 py-5 text-[15px] hover:scale-105 transition-transform inline-flex items-center gap-2 border-2 border-black">
                 Savoir plus sur les programmes <ArrowRight size={20} />
              </Link>
           </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="py-20 px-10 bg-white border-t border-neutral-100">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div>
               <div className="flex items-center gap-3 mb-8">
                 <Image src="/logo.png" alt="MIABO" width={150} height={60} />
                 <div className="h-10 w-[2px] bg-neutral-200" />
                 <span className="text-xs font-black uppercase text-neutral-400 tracking-tighter leading-tight">
                    Tutorat de<br />Madagascar
                 </span>
               </div>
              <address className="not-italic text-sm font-bold text-neutral-500 leading-relaxed max-w-xs space-y-1">
                <p>Antananarivo, Madagascar</p>
                <p>Soutien scolaire bilingue certifié CANOPE.</p>
                <p className="text-black font-black mt-4">(+261) 34 11 222 33</p>
              </address>
            </div>
            
            {/* Trust badges like capture 01-00-58 */}
            <div className="flex gap-4">
               <div className="border border-neutral-200 p-4 rounded-md grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Transparency 2026</div>
                  <div className="font-black text-xl italic text-neutral-800">Candid.</div>
               </div>
               <div className="border border-neutral-200 p-4 rounded-md grayscale hover:grayscale-0 transition-all cursor-pointer bg-purple-50">
                  <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Charity Navigator</div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map(i => <span key={i} className="text-purple-600 text-lg">★</span>)}
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs font-black uppercase tracking-widest text-neutral-400">
             <Link href="#" className="hover:text-black transition-colors">Connexion</Link>
             <Link href="#" className="hover:text-black transition-colors">Inscription</Link>
             <Link href="#" className="hover:text-black transition-colors">Adhésions</Link>
             <Link href="#" className="hover:text-black transition-colors">Programmes</Link>
             <Link href="#" className="hover:text-black transition-colors">S&apos;engager</Link>
             <Link href="#" className="hover:text-black transition-colors">Carrières</Link>
             <Link href="#" className="hover:text-black transition-colors ml-auto">Contact & FAQs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
