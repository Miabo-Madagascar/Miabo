/**
 * Dashboard COSP — hérite de CANOPE + jeunes externes, bilans personnalisés.
 * CDC COSP-001 : mêmes insights que CANOPE + accès aux jeunes non scolarisés.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"
import { CanopeDashboardStats } from "@/components/canope/CanopeDashboardStats"
import { CanopeDashboardRecentBilans } from "@/components/canope/CanopeDashboardRecentBilans"

interface Props { params: Promise<{ locale: string }> }

export default async function CospDashboardPage({ params }: Props) {
  const { locale } = await params
  const base = "cosp"

  return (
    <div className="flex flex-col gap-6">
      {/* ── Bandeau d'accueil ──────────────────────────────────── */}
      <DashboardWelcome />

      {/* ── KPI + taux de complétion ────────────────────────────── */}
      <CanopeDashboardStats locale={locale} basePath={base} />

      {/* ── Tableau des 5 derniers bilans ────────────────────────── */}
      <CanopeDashboardRecentBilans locale={locale} basePath={base} />

      {/* ── Actions rapides ─────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-text-primary">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/${locale}/${base}/bilans`}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-base p-4 transition-all hover:border-primary-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">📊</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Bilans</p>
              <p className="text-xs text-text-muted">VAK · RIASEC · DISC</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/${base}/jeunes`}
            className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-bg-base p-4 transition-all hover:border-secondary-400 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-xl">🧑‍🎓</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Jeunes externes</p>
              <p className="text-xs text-text-muted">Non scolarisés</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/${base}/ressources`}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-base p-4 transition-all hover:border-primary-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">📚</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Ressources</p>
              <p className="text-xs text-text-muted">Contenus certifiés</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/messages`}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-base p-4 transition-all hover:border-primary-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Messages</p>
              <p className="text-xs text-text-muted">Jeunes et familles</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
