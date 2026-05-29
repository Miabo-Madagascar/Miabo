/**
 * Interprétations DISC par profil dominant — basées sur le modèle PROFIL DISC.
 * Forces, défis et style de communication pour chaque dimension.
 */

export interface DiscInterpretation {
  description:   string
  forces:        string[]
  defis:         string[]
  communication: string
}

export const DISC_INTERPRETATIONS: Record<string, DiscInterpretation> = {
  D: {
    description:
      "Le profil D (Dominance) est orienté résultats. Il aime relever des défis, prendre des décisions rapides "
      + "et agir avec détermination pour atteindre ses objectifs.",
    forces: [
      "Prise de décision rapide et assumée",
      "Leadership naturel et goût du challenge",
      "Orientation résultats et sens de l'efficacité",
    ],
    defis: [
      "Peut manquer de patience avec les processus lents",
      "Tendance à passer outre les avis et les émotions des autres",
    ],
    communication:
      "Directe, concise et orientée vers l'action. Préfère les échanges courts et factuels.",
  },
  I: {
    description:
      "Le profil I (Influence) est enthousiaste et communicatif. Il fédère les autres autour de ses idées, "
      + "crée une atmosphère positive et excelle dans les relations interpersonnelles.",
    forces: [
      "Enthousiasme communicatif et optimisme naturel",
      "Facilité à créer du lien et à convaincre",
      "Créativité et ouverture aux nouvelles idées",
    ],
    defis: [
      "Peut manquer de rigueur dans le suivi des détails",
      "Tendance à l'impulsivité et à la dispersion",
    ],
    communication:
      "Expressive et chaleureuse. Aime partager ses idées avec enthousiasme dans un cadre positif.",
  },
  S: {
    description:
      "Le profil S (Stabilité) est fiable et attentionné. Il privilégie l'harmonie, la régularité "
      + "et le soin apporté aux relations humaines. Pilier du groupe, il assure la cohésion d'équipe.",
    forces: [
      "Fiabilité, loyauté et constance dans l'effort",
      "Écoute attentive et sens du travail collaboratif",
      "Patience et capacité à maintenir la paix dans le groupe",
    ],
    defis: [
      "Résistance au changement et à l'imprévu",
      "Difficulté à exprimer ses désaccords ou à dire non",
    ],
    communication:
      "Calme, réfléchie et relationnelle. Préfère un cadre bienveillant avant d'exprimer ses idées.",
  },
  C: {
    description:
      "Le profil C (Conformité) est analytique et rigoureux. Il travaille avec méthode, s'appuie sur les faits "
      + "et cherche à produire un travail de haute qualité en respectant les règles établies.",
    forces: [
      "Précision, rigueur et souci du détail",
      "Esprit analytique et objectivité",
      "Respect des normes et production de haute qualité",
    ],
    defis: [
      "Perfectionnisme pouvant ralentir la prise de décision",
      "Tendance à la sur-analyse face à l'incertitude",
    ],
    communication:
      "Factuelle et structurée. Préfère des échanges préparés, avec données et arguments précis.",
  },
}
