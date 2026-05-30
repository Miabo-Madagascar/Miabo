"use client"

/**
 * Écran d'instruction affiché avant chaque test d'orientation.
 * Invite l'utilisateur à répondre honnêtement et spontanément.
 */

interface Props {
  title:      string          // ex : "Profil VAK"
  duration:   string          // ex : "~6 min"
  questions:  number          // ex : 30
  accent:     string          // couleur principale du test
  onStart:    () => void
  onCancel:   () => void
}

export function TestInstructionScreen({ title, duration, questions, accent, onStart, onCancel }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg">

        {/* Carte principale */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">

          {/* Bande colorée en haut */}
          <div className="h-2 w-full" style={{ background: accent }} />

          <div className="px-8 py-10">
            {/* En-tête */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                {duration} · {questions} questions
              </span>
            </div>

            <h1 className="font-display text-[28px] font-bold tracking-tight text-slate-900 leading-tight mb-2">
              {title}
            </h1>

            {/* Message principal */}
            <div className="mt-6 rounded-2xl p-5" style={{ background: `${accent}0d` }}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">💡</span>
                <div>
                  <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                    Veuillez répondre honnêtement et de manière spontanée.
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">
                    Il n&apos;y a pas de bonne ou de mauvaise réponse. Fiez-vous à votre première impression.
                  </p>
                </div>
              </div>
            </div>

            {/* Consignes rapides */}
            <ul className="mt-5 space-y-2.5">
              {[
                "Lisez chaque affirmation attentivement.",
                "Répondez selon ce que vous ressentez vraiment, pas ce que vous pensez être attendu.",
                "Ne passez pas trop de temps sur une question.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: accent }}>
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>

            {/* Message final */}
            <p className="mt-6 text-center text-[17px] font-bold text-slate-900">
              Bon test ! 🎯
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-8 pb-8">
            <button onClick={onCancel}
              className="cursor-pointer flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">
              Annuler
            </button>
            <button onClick={onStart}
              className="cursor-pointer flex-2 rounded-xl px-4 py-3 text-[14px] font-bold text-white shadow-md transition hover:brightness-105"
              style={{ background: accent, boxShadow: `0 8px 20px ${accent}40` }}>
              Commencer le test →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
