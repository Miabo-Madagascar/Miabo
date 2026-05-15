/**
 * Données du test VAK — questions et description officielle.
 * Les affirmations seront portées à 30 (10/profil) en Étape 2 après réception des documents PJ.
 */

export const VAK_DESCRIPTION =
  "Le test VAK permet d'identifier votre style d'apprentissage dominant : Visuel, Auditif ou " +
  "Kinesthésique, c'est-à-dire la manière dont vous comprenez et retenez le mieux les informations. " +
  "En quelques questions simples, il vous aide à mieux connaître votre mode de fonctionnement " +
  "afin d'adapter vos méthodes d'apprentissage ou de travail."

export interface VakQuestion {
  id:   number
  text: string
  type: "V" | "A" | "K"
}

export const VAK_QUESTIONS: VakQuestion[] = [
  { id: 1,  text: "Quand je lis un livre, j'imagine les scènes dans ma tête.", type: "V" },
  { id: 2,  text: "J'aime écouter des podcasts ou la radio pour apprendre.", type: "A" },
  { id: 3,  text: "Je ne peux pas m'empêcher de bouger mes mains en parlant.", type: "K" },
  { id: 4,  text: "Les schémas, cartes et graphiques m'aident à comprendre.", type: "V" },
  { id: 5,  text: "Je préfère que l'on m'explique les choses à l'oral.", type: "A" },
  { id: 6,  text: "J'ai besoin de manipuler les objets pour comprendre comment ils marchent.", type: "K" },
  { id: 7,  text: "Je me souviens mieux des visages que des noms.", type: "V" },
  { id: 8,  text: "Je parle souvent tout seul quand je réfléchis.", type: "A" },
  { id: 9,  text: "J'aime les activités physiques, le sport ou la danse.", type: "K" },
  { id: 10, text: "Je suis sensible aux couleurs et à l'harmonie visuelle.", type: "V" },
  { id: 11, text: "Je reconnais facilement les voix au téléphone.", type: "A" },
  { id: 12, text: "J'apprends mieux en pratiquant qu'en lisant des instructions.", type: "K" },
]
