/**
 * cn() — fusionne les classes Tailwind sans conflits.
 * Requiert : clsx + tailwind-merge
 * TODO PHASE 1 : npm install clsx tailwind-merge
 */

// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]): string {
//   return twMerge(clsx(inputs))
// }

/** Stub temporaire jusqu'à l'installation des dépendances */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}
