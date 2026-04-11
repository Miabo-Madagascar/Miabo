"use client"

import { useState } from "react"

export function TestsInfoModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-100"
        title="Comprendre les tests"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Que signifient ces sigles ?
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-bg-base p-6 text-left shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Les tests de personnalité</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid gap-6">
              {/* VAK */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <span className="text-lg font-black">VAK</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Styles d'apprentissage (Visuel, Auditif, Kinesthésique)</h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    Ce test définit comment l'élève mémorise et assimile le mieux les informations. 
                    <strong className="text-text-primary"> V</strong> (Visuel : par l'image), 
                    <strong className="text-text-primary"> A</strong> (Auditif : par le son/la parole), ou 
                    <strong className="text-text-primary"> K</strong> (Kinesthésique : par l'action/le toucher).
                  </p>
                </div>
              </div>

              {/* RIASEC */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600">
                  <span className="text-lg font-black">RIA</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Intérêts professionnels (Typologie de Holland)</h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    Détermine les environnements de travail qui lui correspondent parmi 6 profils : 
                    <strong className="text-text-primary"> R</strong>éaliste, 
                    <strong className="text-text-primary"> I</strong>nvestigateur, 
                    <strong className="text-text-primary"> A</strong>rtistique, 
                    <strong className="text-text-primary"> S</strong>ocial, 
                    <strong className="text-text-primary"> E</strong>ntreprenant, et 
                    <strong className="text-text-primary"> C</strong>onventionnel.
                  </p>
                </div>
              </div>

              {/* DISC */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <span className="text-lg font-black">DISC</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Profil Comportemental</h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    Analyse la façon dont l'élève interagit avec les autres et fait face aux défis. 
                    <strong className="text-text-primary"> D</strong>ominant (Direct), 
                    <strong className="text-text-primary"> I</strong>nfluent (Communicatif), 
                    <strong className="text-text-primary"> S</strong>table (Patient), 
                    <strong className="text-text-primary"> C</strong>onsciencieux (Précis).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-600 transition-colors"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
