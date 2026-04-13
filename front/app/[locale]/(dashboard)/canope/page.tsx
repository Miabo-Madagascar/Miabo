/**
 * Dashboard CANOPE — insights, bilans récents, actions rapides.
 * CDC CAN-001 : compteur jeunes, tableau récapitulatif, sessions à venir.
 */

import Link from "next/link"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"
import { CanopeDashboardStats } from "@/components/canope/CanopeDashboardStats"
import { CanopeDashboardRecentBilans } from "@/components/canope/CanopeDashboardRecentBilans"

interface Props { params: Promise<{ locale: string }> }

export default async function CanopeDashboardPage({ params }: Props) {
  const { locale } = await params
  const base = "canope"

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
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href={`/${locale}/${base}/bilans`}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-base p-4 transition-all hover:border-primary-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">📊</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Tous les bilans</p>
              <p className="text-xs text-text-muted">VAK · RIASEC · DISC</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/${base}/ressources`}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-base p-4 transition-all hover:border-primary-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">📚</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Ressources</p>
              <p className="text-xs text-text-muted">Contenus certifiés CANOPE</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/messages`}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-base p-4 transition-all hover:border-primary-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Messages</p>
              <p className="text-xs text-text-muted">Élèves et familles</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
