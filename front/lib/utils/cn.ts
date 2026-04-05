/**
 * cn() — fusionne les classes Tailwind sans conflits.
 * Combine clsx (conditionnels) + tailwind-merge (déduplication).
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
