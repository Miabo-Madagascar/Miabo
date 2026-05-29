/**
 * Interprétations RIASEC par type — issues du PDF U-MAGIS (modèle de Holland).
 * Tableau INTÉRÊTS / APTITUDES / TRAITS / CHAMPS DE MÉTIERS pour chaque dimension.
 */

export interface RiasecInterpretation {
  interets:   string
  aptitudes:  string
  traits:     string
  champs:     string
}

export const RIASEC_INTERPRETATIONS: Record<string, RiasecInterpretation> = {
  R: {
    interets:  "Activités concrètes et manuelles, mécanique, plein air, animaux et nature, artisanat et construction",
    aptitudes: "Habileté manuelle et technique, coordination physique, sens pratique, maîtrise des outils",
    traits:    "Concret, honnête, stable, persévérant, réservé, indépendant",
    champs:    "Mécanique, BTP, agriculture, artisanat, électronique, génie civil, transports",
  },
  I: {
    interets:  "Sciences, mathématiques, recherche, observation, analyse et résolution de problèmes complexes",
    aptitudes: "Raisonnement mathématique et scientifique, esprit analytique, curiosité intellectuelle",
    traits:    "Analytique, curieux, autonome, précis, réservé, rigoureux",
    champs:    "Sciences, médecine, informatique, ingénierie, recherche, environnement, pharmacie",
  },
  A: {
    interets:  "Création, expression artistique, musique, littérature, arts visuels, design, esthétique",
    aptitudes: "Créativité, imagination, sens esthétique, aptitudes musicales ou plastiques, expression",
    traits:    "Expressif, imaginatif, original, sensible, indépendant, intuitif",
    champs:    "Arts visuels, musique, littérature, design, architecture, spectacle, communication",
  },
  S: {
    interets:  "Aide aux autres, enseignement, conseil, soin, animation, relations humaines et travail d'équipe",
    aptitudes: "Empathie, communication interpersonnelle, pédagogie, capacité d'écoute, sens du service",
    traits:    "Coopératif, généreux, patient, chaleureux, compréhensif, sociable",
    champs:    "Enseignement, santé, services sociaux, conseil, psychologie, travail humanitaire",
  },
  E: {
    interets:  "Leadership, entrepreneuriat, affaires, management, vente, prise de décision et persuasion",
    aptitudes: "Leadership, sens de la négociation et de la persuasion, prise d'initiative, organisation",
    traits:    "Ambitieux, énergique, optimiste, sociable, dynamique, confiant",
    champs:    "Commerce, management, entrepreneuriat, politique, droit, marketing, finance",
  },
  C: {
    interets:  "Organisation, gestion de données, comptabilité, administration, procédures et méthodes structurées",
    aptitudes: "Précision, rigueur, organisation, aptitudes administratives et bureautiques, sens du détail",
    traits:    "Ordonné, méticuleux, conformiste, fiable, efficace, méthodique",
    champs:    "Finance, comptabilité, administration, secrétariat, gestion, informatique de gestion",
  },
}
