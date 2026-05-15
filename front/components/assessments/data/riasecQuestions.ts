/**
 * Données du test RIASEC — questions et description officielle.
 * Les affirmations seront portées à 30 (5/profil) en Étape 2 après réception des documents PJ.
 */

export const RIASEC_DESCRIPTION =
  "Le test RIASEC permet d'identifier vos intérêts professionnels dominants parmi six profils : " +
  "Réaliste, Investigateur, Artistique, Social, Entreprenant et Conventionnel. " +
  "Il vous aide à mieux comprendre les environnements et activités qui vous correspondent le plus " +
  "pour orienter vos choix d'études ou de carrière."

export interface RiasecQuestion {
  id:   number
  text: string
  type: "R" | "I" | "A" | "S" | "E" | "C"
}

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  { id: 1,  text: "J'aime réparer des appareils électriques ou mécaniques.", type: "R" },
  { id: 2,  text: "J'aime faire des recherches scientifiques ou mathématiques.", type: "I" },
  { id: 3,  text: "J'aime dessiner, peindre ou sculpter.", type: "A" },
  { id: 4,  text: "J'aime aider les autres à résoudre leurs problèmes.", type: "S" },
  { id: 5,  text: "J'aime diriger une équipe ou influencer les autres.", type: "E" },
  { id: 6,  text: "J'aime organiser des fichiers, des données ou des horaires.", type: "C" },
  { id: 7,  text: "J'aime travailler en plein air.", type: "R" },
  { id: 8,  text: "J'aime comprendre le fonctionnement des choses complexes.", type: "I" },
  { id: 9,  text: "J'aime écrire des histoires ou des poèmes.", type: "A" },
  { id: 10, text: "J'aime enseigner ou transmettre mes connaissances.", type: "S" },
  { id: 11, text: "J'aime convaincre les gens d'acheter un produit.", type: "E" },
  { id: 12, text: "J'aime le travail précis qui demande de la rigueur.", type: "C" },
]
