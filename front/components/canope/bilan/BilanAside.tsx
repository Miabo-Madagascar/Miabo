import type { Assessment } from "@/types"

interface Props { assessment: Assessment }

export function BilanAside({ assessment }: Props) {
  const name    = assessment.external_young_full_name ?? "Élève MIABO"
  const dateStr = new Date(assessment.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  })

  const details: [string, string][] = [
    ["Élève",            name],
    ...(assessment.serie ? [["Série", assessment.serie] as [string, string]] : []),
    ["Date d'ouverture", dateStr],
  ]

  return (
    <aside className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500 mb-4">Détails</h3>
        <dl className="space-y-3">
          {details.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{k}</dt>
              <dd className="mt-0.5 text-[13px] font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
          <span className="text-slate-900 font-bold">Bon à savoir.</span>{" "}
          Les 3 tests peuvent être passés dans n&apos;importe quel ordre.
          Comptez environ 15 minutes au total.
        </p>
      </div>
    </aside>
  )
}
