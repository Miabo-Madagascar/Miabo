/**
 * Formateurs — monnaie, dates, durées.
 */

/** Formate un montant en Ariary Malgache. Ex: 25000 → "25 000 Ar" */
export function formatAriary(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} Ar`
}

/** Formate une date ISO en date lisible selon la locale. */
export function formatDate(
  isoString: string,
  locale: "fr" | "mg" = "fr"
): string {
  const date = new Date(isoString)
  const localeMap = { fr: "fr-FR", mg: "mg-MG" } as const
  return new Intl.DateTimeFormat(localeMap[locale], {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(date)
}

/** Formate une heure ISO. Ex: "2025-06-01T10:30:00Z" → "10h30" */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const h = date.getHours().toString().padStart(2, "0")
  const m = date.getMinutes().toString().padStart(2, "0")
  return `${h}h${m}`
}

/** Formate une durée en minutes. Ex: 90 → "1h30" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, "0")}`
}

/** Formate une note sur 5. Ex: 4.7 → "4,7 / 5" */
export function formatRating(rating: number | null): string {
  if (rating === null) return "—"
  return `${rating.toFixed(1).replace(".", ",")} / 5`
}
