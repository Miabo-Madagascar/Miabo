/**
 * Métadonnées des profils DISC — couleurs, noms, traits, sous-titres.
 */

export interface DiscProfile {
  letter: string
  name:   string
  trait:  string
  sub:    string
  tone:   string
}

export const DISC_PROFILES: Record<string, DiscProfile> = {
  D: {
    letter: "D",
    name:   "Dominance",
    trait:  "Action · Décision",
    sub:    "Tendance à prendre les devants, relever les défis et trancher vite.",
    tone:   "#dc2626",
  },
  I: {
    letter: "I",
    name:   "Influence",
    trait:  "Échange · Persuasion",
    sub:    "À l'aise pour fédérer, convaincre et porter une idée en groupe.",
    tone:   "#d97706",
  },
  S: {
    letter: "S",
    name:   "Stabilité",
    trait:  "Constance · Écoute",
    sub:    "Privilégie l'harmonie, la régularité et le soin de la relation.",
    tone:   "#16a34a",
  },
  C: {
    letter: "C",
    name:   "Conformité",
    trait:  "Rigueur · Méthode",
    sub:    "Aime l'analyse, la précision et le respect des règles établies.",
    tone:   "#2450ed",
  },
}

export const DISC_ORDER = ["D", "I", "S", "C"] as const
export type DiscType = typeof DISC_ORDER[number]
