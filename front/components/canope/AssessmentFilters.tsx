"use client"
/**
 * AssessmentFilters — barre de recherche, filtres par date et tri.
 * Utilisé dans AssessmentListClient (CDC §5 : filtre/tri/recherche).
 */

export interface FilterState {
  search:   string
  dateFrom: string
  dateTo:   string
  sortBy:   "date_desc" | "date_asc" | "name_asc" | "name_desc"
}

interface Props {
  filters:  FilterState
  onChange: (patch: Partial<FilterState>) => void
  total:    number
  filtered: number
}

const SORT_OPTIONS = [
  { v: "date_desc", l: "Plus récent d'abord" },
  { v: "date_asc",  l: "Plus ancien d'abord" },
  { v: "name_asc",  l: "Nom A → Z"           },
  { v: "name_desc", l: "Nom Z → A"           },
] as const

const INPUT_CLS = "rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors"

export function AssessmentFilters({ filters, onChange, total, filtered }: Props) {
  const hasActive = !!(filters.search || filters.dateFrom || filters.dateTo)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-base p-4">
      {/* Ligne 1 : recherche + tri */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={filters.search} placeholder="Rechercher par nom…"
            onChange={e => onChange({ search: e.target.value })}
            className={`${INPUT_CLS} w-full pl-9 pr-4`}
          />
        </div>
        {/* Tri */}
        <select value={filters.sortBy}
          onChange={e => onChange({ sortBy: e.target.value as FilterState["sortBy"] })}
          className={INPUT_CLS}
        >
          {SORT_OPTIONS.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Ligne 2 : filtres par date + compteur */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-text-muted">Du</span>
        <input type="date" value={filters.dateFrom}
          onChange={e => onChange({ dateFrom: e.target.value })}
          className={INPUT_CLS} />
        <span className="text-xs font-medium text-text-muted">au</span>
        <input type="date" value={filters.dateTo}
          onChange={e => onChange({ dateTo: e.target.value })}
          className={INPUT_CLS} />
        {hasActive && (
          <button type="button"
            onClick={() => onChange({ search: "", dateFrom: "", dateTo: "" })}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:bg-bg-subtle transition-colors">
            Réinitialiser
          </button>
        )}
        <span className="ml-auto text-[10px] font-medium text-text-muted">
          {filtered} / {total} bilan{total > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}
