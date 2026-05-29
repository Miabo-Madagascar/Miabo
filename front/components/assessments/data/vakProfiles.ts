/**
 * Métadonnées des profils VAK — couleurs, noms, traits, sous-titres.
 */

export interface VakProfile {
  letter: string
  name:   string
  trait:  string
  sub:    string
  tone:   string
}

export const VAK_PROFILES: Record<string, VakProfile> = {
  V: {
    letter: "V",
    name:   "Visuel",
    trait:  "Observation · Imagerie",
    sub:    "Apprend en visualisant : schémas, couleurs, cartes mentales, scènes imaginées.",
    tone:   "#7c3aed",
  },
  A: {
    letter: "A",
    name:   "Auditif",
    trait:  "Écoute · Verbalisation",
    sub:    "Apprend en écoutant, en parlant et en se racontant les idées à voix haute.",
    tone:   "#0891b2",
  },
  K: {
    letter: "K",
    name:   "Kinesthésique",
    trait:  "Action · Manipulation",
    sub:    "Apprend en faisant, en touchant, en bougeant — la mémoire passe par le corps.",
    tone:   "#ea580c",
  },
}

export const VAK_ORDER = ["V", "A", "K"] as const
export type VakType = typeof VAK_ORDER[number]
