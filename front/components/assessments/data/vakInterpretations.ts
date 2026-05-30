/**
 * Interprétations VAK par profil dominant — textes issus du PDF SESAME/BOE.
 * Méthode de travail et conseils pratiques pour chaque style d'apprentissage.
 */

export interface VakInterpretation {
  description: string
  methode:     string[]
  conseils:    string[]
}

export const VAK_INTERPRETATIONS: Record<string, VakInterpretation> = {
  V: {
    description:
      "Les visuels sont sensibles aux détails des couleurs, des formes, des structures et de l'espace. "
      + "Ils pensent souvent en images et ont besoin de voir l'information pour la comprendre et la retenir.",
    methode: [
      "Visualiser les informations sous forme de schémas, cartes mentales et tableaux colorés",
      "Mémoriser la position spatiale des données sur la page ou le tableau",
      "Imaginer mentalement les scènes ou situations pour ancrer les notions clés",
    ],
    conseils: [
      "Prépare des fiches de révision illustrées avec des codes couleur",
      "Utilise des exemples visuels et des diagrammes explicatifs",
      "Organise ton espace et ton plan de travail de façon visuelle et aérée",
    ],
  },
  A: {
    description:
      "Les auditifs mémorisent en écoutant et en verbalisant. Ils apprennent en s'entendant répéter les informations, "
      + "en suivant un rythme ou en échangeant oralement avec d'autres.",
    methode: [
      "Écouter des cours enregistrés, des podcasts ou lire à voix haute",
      "Se raconter la leçon mentalement ou en l'expliquant à voix haute",
      "Utiliser des mnémotechniques sonores, des rimes ou des formules rythmées",
    ],
    conseils: [
      "Relis tes cours en te posant des questions à voix haute",
      "Reformule les notions clés en les expliquant à quelqu'un d'autre",
      "Enregistre des résumés audio pour réviser en mobilité",
    ],
  },
  K: {
    description:
      "Les kinesthésiques apprennent par l'expérience et le mouvement — la mémoire passe par le corps. "
      + "Ils ont besoin de toucher, de pratiquer et de vivre concrètement les situations pour retenir durablement.",
    methode: [
      "Apprendre par l'action : travaux pratiques, manipulations, expériences concrètes",
      "Prendre des notes à la main pour ancrer physiquement les informations",
      "Relier chaque notion abstraite à une situation vécue ou un exemple tangible",
    ],
    conseils: [
      "Utilise des exemples concrets et des mises en pratique immédiates",
      "Reformule les leçons dans tes propres mots pour te les approprier",
      "Participe activement en cours : pose des questions, prends part aux exercices",
    ],
  },
}
