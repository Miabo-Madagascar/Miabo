/**
 * Métadonnées des profils RIASEC — couleurs, noms, traits, sous-titres.
 * Basé sur le modèle de Holland (hexagone des intérêts professionnels).
 */

export interface RiasecProfile {
  letter: string
  name:   string
  trait:  string
  sub:    string
  tone:   string
}

export const RIASEC_PROFILES: Record<string, RiasecProfile> = {
  R: {
    letter: "R",
    name:   "Réaliste",
    trait:  "Faire · Construire",
    sub:    "Préfère l'action concrète, les outils, la nature et les choses qui marchent.",
    tone:   "#a16207",
  },
  I: {
    letter: "I",
    name:   "Investigateur",
    trait:  "Analyser · Comprendre",
    sub:    "Aime observer, expérimenter, résoudre des problèmes intellectuels.",
    tone:   "#1e40af",
  },
  A: {
    letter: "A",
    name:   "Artistique",
    trait:  "Créer · Exprimer",
    sub:    "S'épanouit dans la création, l'imagination et l'expression personnelle.",
    tone:   "#be185d",
  },
  S: {
    letter: "S",
    name:   "Social",
    trait:  "Aider · Transmettre",
    sub:    "Cherche à aider, enseigner, soigner et créer du lien avec les autres.",
    tone:   "#15803d",
  },
  E: {
    letter: "E",
    name:   "Entreprenant",
    trait:  "Diriger · Persuader",
    sub:    "Aime entreprendre, convaincre, prendre des risques et mener une équipe.",
    tone:   "#b91c1c",
  },
  C: {
    letter: "C",
    name:   "Conventionnel",
    trait:  "Organiser · Vérifier",
    sub:    "Apprécie l'ordre, la précision, les données et les procédures claires.",
    tone:   "#475569",
  },
}

export const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const
export type RiasecType = typeof RIASEC_ORDER[number]
