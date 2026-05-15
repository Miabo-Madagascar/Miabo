"use client"
/**
 * CanopeDashboardStats — 4 KPI cards + taux de complétion.
 * Données : GET /api/v1/assessments/stats
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import type { AssessmentStats } from "@/types"

interface Props { locale: string; basePath: string }

interface KpiCard {
  label:    string
  key:      keyof Pick<AssessmentStats, "total" | "in_progress" | "validated" | "this_month">
  sublabel: string
  accent:   string
  bg:       string
  icon:     string
}

const CARDS: KpiCard[] = [
  { label: "Total bilans",  key: "total",       sublabel: "créés", accent: "text-primary",        bg: "bg-primary-50   border-primary-100",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "En cours",      key: "in_progress", sublabel: "bilans actifs", accent: "text-warning",  bg: "bg-warning/5    border-warning/20",     icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Validés",       key: "validated",   sublabel: "bilans clôturés", accent: "text-success", bg: "bg-success/5    border-success/20",   icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Ce mois",       key: "this_month",  sublabel: "nouveaux bilans", accent: "text-info",    bg: "bg-info/5       border-info/20",      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
]

export function CanopeDashboardStats({ locale, basePath }: Props) {
  const [stats,   setStats]   = useState<AssessmentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AssessmentStats>("/assessments/stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="flex flex-col gap-4">
      {/* ── KPI cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map(({ label, key, sublabel, accent, bg, icon }) => (
          <div key={key} className={`relative flex flex-col gap-3 rounded-2xl border p-5 ${bg}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
              <svg className={`h-4 w-4 ${accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            {loading ? (
              <div className="h-9 w-16 animate-pulse rounded-lg bg-bg-muted" />
            ) : (
              <p className={`text-4xl font-black tracking-tight ${accent}`}>
                {stats?.[key] ?? 0}
              </p>
            )}
            <p className="text-xs text-text-muted">{sublabel}</p>
          </div>
        ))}
      </div>

      {/* ── Taux de complétion + CTA ──────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-base p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
            <span>Taux de complétion</span>
            <span className="text-primary font-bold">{loading ? "—" : `${stats?.completion_rate ?? 0} %`}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${stats?.completion_rate ?? 0}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted">
            {loading ? "" : `${stats?.validated ?? 0} bilans validés sur ${stats?.total ?? 0} créés`}
          </p>
        </div>

        <Link
          href={`/${locale}/${basePath}/bilans/nouveau`}
          className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary-600 sm:ml-6"
        >
          + Créer un bilan
        </Link>
      </div>
    </section>
  )
}
