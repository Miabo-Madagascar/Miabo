"use client"
/**
 * AssessmentListClient — tableau des bilans avec filtre/tri/recherche (CDC §5).
 * Colonnes : Nom complet | Date & heure | VAK | RIASEC | DISC | Statut | Modifier
 */

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { api, ApiError } from "@/lib/api/client"
import { AssessmentStatus } from "@/types"
import type { Assessment } from "@/types"
import { AssessmentFilters, type FilterState } from "./AssessmentFilters"

interface Props { locale: string; basePath: string }

const STATUS_CFG = {
  [AssessmentStatus.Draft]:             { label: "Brouillon", cls: "bg-gray-100 text-gray-600" },
  [AssessmentStatus.InProgress]:        { label: "En cours",  cls: "bg-primary-50 text-primary-700" },
  [AssessmentStatus.PendingValidation]: { label: "À valider", cls: "bg-amber-50 text-amber-700" },
  [AssessmentStatus.Validated]:         { label: "Validé",    cls: "bg-success/10 text-success" },
}

const EMPTY_FILTERS: FilterState = { search: "", dateFrom: "", dateTo: "", sortBy: "date_desc" }

const displayName = (a: Assessment) => a.external_young_full_name ?? a.student_full_name ?? "Jeune externe"

export function AssessmentListClient({ locale, basePath }: Props) {
  const [rows,    setRows]    = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  useEffect(() => {
    api.get<Assessment[]>("/assessments/")
      .then(setRows)
      .catch(err => setError(err instanceof ApiError ? err.detail : "Erreur de chargement"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let data = [...rows]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      data = data.filter(a => displayName(a).toLowerCase().includes(q))
    }
    if (filters.dateFrom) data = data.filter(a => a.created_at >= filters.dateFrom)
    if (filters.dateTo)   data = data.filter(a => a.created_at <= filters.dateTo + "T23:59:59")
    data.sort((a, b) => {
      if (filters.sortBy === "date_asc")  return a.created_at.localeCompare(b.created_at)
      if (filters.sortBy === "name_asc")  return displayName(a).localeCompare(displayName(b))
      if (filters.sortBy === "name_desc") return displayName(b).localeCompare(displayName(a))
      return b.created_at.localeCompare(a.created_at)
    })
    return data
  }, [rows, filters])

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-bg-muted" />
  if (error)   return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-error">{error}</p>

  return (
    <div className="flex flex-col gap-4">
      <AssessmentFilters
        filters={filters} total={rows.length} filtered={filtered.length}
        onChange={p => setFilters(prev => ({ ...prev, ...p }))}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-bg-subtle p-10 text-center">
          <p className="text-base font-bold text-text-primary">Aucun bilan trouvé</p>
          <p className="text-sm text-text-secondary">Essayez de modifier les filtres de recherche.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-base shadow-sm">
          <table className="w-full min-w-160 text-sm">
            <thead className="border-b border-border bg-bg-subtle">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3 text-left">Nom complet</th>
                <th className="px-4 py-3 text-center">Date &amp; heure</th>
                <th className="px-4 py-3 text-center">VAK</th>
                <th className="px-4 py-3 text-center">RIASEC</th>
                <th className="px-4 py-3 text-center">DISC</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(a => {
                const cfg  = STATUS_CFG[a.status as AssessmentStatus] ?? STATUS_CFG[AssessmentStatus.Draft]
                const name = displayName(a)
                const date = new Date(a.created_at).toLocaleDateString("fr-MG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                const val  = (v: string | null) => v
                  ? <span className="font-bold text-primary">{v}</span>
                  : <span className="text-text-muted">—</span>
                return (
                  <tr key={a.id} className="transition-colors hover:bg-bg-subtle">
                    <td className="px-5 py-3 font-semibold text-text-primary">
                      <div className="flex items-center gap-2">
                        <span>{name}</span>
                        {a.administered_by === null && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            Auto-bilan élève
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-text-muted">{date}</td>
                    <td className="px-4 py-3 text-center">{val(a.vak_dominant)}</td>
                    <td className="px-4 py-3 text-center">{val(a.riasec_code)}</td>
                    <td className="px-4 py-3 text-center">{val(a.disc_dominant)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/${locale}/${basePath}/bilans/${a.id}`}
                        className="rounded-lg bg-bg-muted px-4 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-primary hover:text-white">
                        Modifier
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
