"use client"
/**
 * CanopeDashboardRecentBilans — tableau des 5 derniers bilans (CDC CAN-001).
 * Colonnes : Nom | Date | VAK | RIASEC | DISC | Statut | Action
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { AssessmentStatus } from "@/types"
import type { Assessment } from "@/types"

interface Props { locale: string; basePath: string }

const STATUS_CFG = {
  [AssessmentStatus.Draft]:      { label: "Brouillon", cls: "bg-gray-100 text-gray-600" },
  [AssessmentStatus.InProgress]: { label: "En cours",  cls: "bg-primary-50 text-primary-700" },
  [AssessmentStatus.Validated]:  { label: "Validé",    cls: "bg-success/10 text-success" },
}

const TEST_CELL = (value: string | null) =>
  value
    ? <span className="font-bold text-primary">{value}</span>
    : <span className="text-text-muted">—</span>

export function CanopeDashboardRecentBilans({ locale, basePath }: Props) {
  const [rows,    setRows]    = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Assessment[]>("/assessments/")
      .then(data => setRows(data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-text-primary">Derniers bilans</h2>
        <Link
          href={`/${locale}/${basePath}/bilans`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Voir tous →
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-base shadow-sm">
        {/* ── En-tête ───────────────────────────────────────────── */}
        <div className="hidden grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 border-b border-border bg-bg-subtle px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-text-muted sm:grid">
          <span>Nom</span>
          <span className="text-center w-12">VAK</span>
          <span className="text-center w-14">RIASEC</span>
          <span className="text-center w-12">DISC</span>
          <span className="text-center w-20">Statut</span>
          <span className="w-16" />
        </div>

        {/* ── Lignes ────────────────────────────────────────────── */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
              <div className="h-4 flex-1 animate-pulse rounded bg-bg-muted" />
              <div className="h-4 w-28 animate-pulse rounded bg-bg-muted" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-text-muted">
            Aucun bilan créé pour l&apos;instant.
          </p>
        ) : (
          rows.map(a => {
            const cfg  = STATUS_CFG[a.status as AssessmentStatus] ?? STATUS_CFG[AssessmentStatus.Draft]
            const name = a.external_young_full_name ?? (a.student_profile_id ? "Élève MIABO" : "Jeune externe")
            const date = new Date(a.created_at).toLocaleDateString("fr-MG", { day: "numeric", month: "short" })

            return (
              <div
                key={a.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 border-b border-border px-5 py-4 last:border-0 hover:bg-bg-subtle sm:grid-cols-[1fr_auto_auto_auto_auto_auto]"
              >
                {/* Nom + date */}
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-text-primary">{name}</span>
                  <span className="text-[10px] text-text-muted">{date}</span>
                </div>

                {/* Résultats tests */}
                <span className="hidden w-12 text-center text-sm sm:block">{TEST_CELL(a.vak_dominant)}</span>
                <span className="hidden w-14 text-center text-sm sm:block">{TEST_CELL(a.riasec_code)}</span>
                <span className="hidden w-12 text-center text-sm sm:block">{TEST_CELL(a.disc_dominant)}</span>

                {/* Statut */}
                <span className={`hidden w-20 rounded-full px-2 py-0.5 text-center text-[10px] font-bold sm:block ${cfg.cls}`}>
                  {cfg.label}
                </span>

                {/* Action */}
                <Link
                  href={`/${locale}/${basePath}/bilans/${a.id}`}
                  className="w-16 rounded-lg bg-bg-muted px-3 py-1.5 text-center text-xs font-semibold text-text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Ouvrir
                </Link>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
