/**
 * Données du test RIASEC — 66 activités officielles U-MAGIS / emploiquebec.gouv.qc.ca.
 * Textes exacts du document "Test RIASEC U-MAGIS.pdf" (11 activités par profil).
 * Adaptées au format Likert 1-5 via le préfixe "J'aime...".
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
  { id:  1, text: "J'aime suivre des cours de mécanique.",                                              type: "R" },
  { id:  2, text: "J'aime réparer les appareils électriques.",                                          type: "R" },
  { id:  3, text: "J'aime travailler dehors.",                                                          type: "R" },
  { id:  4, text: "J'aime travailler avec des animaux ou des plantes.",                                 type: "R" },
  { id:  5, text: "J'aime travailler en menuiserie.",                                                   type: "R" },
  { id:  6, text: "J'aime faire un travail manuel comportant des sorties fréquentes.",                  type: "R" },
  { id:  7, text: "J'aime travailler le métal ou utiliser une machine.",                                type: "R" },
  { id:  8, text: "J'aime faire des déplacements fréquents, voyager.",                                  type: "R" },
  { id:  9, text: "J'aime suivre des cours de dessin mécanique.",                                       type: "R" },
  { id: 10, text: "J'aime conduire un camion ou un autobus.",                                           type: "R" },
  { id: 11, text: "J'aime faire des activités en plein-air (camping, pêche, canot, etc.).",             type: "R" },
  { id: 12, text: "J'aime suivre des cours de biologie.",                                               type: "I" },
  { id: 13, text: "J'aime lire des revues ou des livres scientifiques.",                                type: "I" },
  { id: 14, text: "J'aime travailler dans un laboratoire.",                                             type: "I" },
  { id: 15, text: "J'aime travailler à un projet scientifique.",                                        type: "I" },
  { id: 16, text: "J'aime poser des questions.",                                                        type: "I" },
  { id: 17, text: "J'aime faire des expériences de chimie.",                                            type: "I" },
  { id: 18, text: "J'aime lire des ouvrages sur des sujets particuliers, étudier.",                     type: "I" },
  { id: 19, text: "J'aime solutionner des problèmes de mathématique.",                                  type: "I" },
  { id: 20, text: "J'aime cultiver et soigner des plantes.",                                            type: "I" },
  { id: 21, text: "J'aime observer des phénomènes physiques.",                                          type: "I" },
  { id: 22, text: "J'aime observer et analyser des faits.",                                             type: "I" },
  { id: 23, text: "J'aime suivre des cours d'art.",                                                     type: "A" },
  { id: 24, text: "J'aime esquisser, dessiner ou peindre.",                                             type: "A" },
  { id: 25, text: "J'aime voir des pièces de théâtre.",                                                 type: "A" },
  { id: 26, text: "J'aime faire des plans de meubles.",                                                 type: "A" },
  { id: 27, text: "J'aime jouer d'un instrument de musique dans un groupe / orchestre.",                type: "A" },
  { id: 28, text: "J'aime composer de la musique.",                                                     type: "A" },
  { id: 29, text: "J'aime assister à des récitals, des concerts.",                                      type: "A" },
  { id: 30, text: "J'aime lire des livres de fiction.",                                                 type: "A" },
  { id: 31, text: "J'aime faire de la photographie.",                                                   type: "A" },
  { id: 32, text: "J'aime jouer dans une pièce de théâtre.",                                            type: "A" },
  { id: 33, text: "J'aime lire ou écrire de la poésie.",                                                type: "A" },
  { id: 34, text: "J'aime prendre soin des enfants.",                                                   type: "S" },
  { id: 35, text: "J'aime rendre service et aider les autres.",                                         type: "S" },
  { id: 36, text: "J'aime aller à des fêtes et danser.",                                                type: "S" },
  { id: 37, text: "J'aime lire des livres de psychologie.",                                             type: "S" },
  { id: 38, text: "J'aime faire du bénévolat.",                                                         type: "S" },
  { id: 39, text: "J'aime soigner les gens.",                                                           type: "S" },
  { id: 40, text: "J'aime connaître de nouvelles personnes.",                                           type: "S" },
  { id: 41, text: "J'aime assister à des réunions ou à des conférences.",                               type: "S" },
  { id: 42, text: "J'aime aider les autres à régler leurs problèmes.",                                  type: "S" },
  { id: 43, text: "J'aime être membre de clubs sociaux.",                                               type: "S" },
  { id: 44, text: "J'aime écouter les autres.",                                                         type: "S" },
  { id: 45, text: "J'aime influencer les autres.",                                                      type: "E" },
  { id: 46, text: "J'aime vendre un produit ou un service.",                                            type: "E" },
  { id: 47, text: "J'aime discuter de politique.",                                                      type: "E" },
  { id: 48, text: "J'aime donner des conférences, parler en public.",                                   type: "E" },
  { id: 49, text: "J'aime être chef d'un groupe.",                                                      type: "E" },
  { id: 50, text: "J'aime animer une réunion.",                                                         type: "E" },
  { id: 51, text: "J'aime travailler en équipe.",                                                       type: "E" },
  { id: 52, text: "J'aime prendre des décisions importantes.",                                          type: "E" },
  { id: 53, text: "J'aimerais avoir une entreprise.",                                                   type: "E" },
  { id: 54, text: "J'aime diriger un groupe.",                                                          type: "E" },
  { id: 55, text: "J'aime exposer mon point de vue devant un groupe.",                                  type: "E" },
  { id: 56, text: "J'aime garder mon bureau ou ma chambre bien rangés.",                                type: "C" },
  { id: 57, text: "J'aime tenir des registres détaillés de dépenses.",                                  type: "C" },
  { id: 58, text: "J'aime classer des lettres, des rapports et des dossiers.",                          type: "C" },
  { id: 59, text: "J'aime écrire des lettres d'affaires.",                                              type: "C" },
  { id: 60, text: "J'aime repérer des erreurs dans des nombres et des mots.",                           type: "C" },
  { id: 61, text: "J'aime additionner, soustraire, multiplier, diviser.",                               type: "C" },
  { id: 62, text: "J'aime suivre des cours reliés aux affaires.",                                       type: "C" },
  { id: 63, text: "J'aime transcrire un texte et effectuer la mise en page.",                           type: "C" },
  { id: 64, text: "J'aime travailler sous la direction d'un patron ou d'une patronne.",                 type: "C" },
  { id: 65, text: "J'aime tenir des dossiers à jour.",                                                  type: "C" },
  { id: 66, text: "J'aime prendre des commandes par téléphone ou internet.",                            type: "C" },
]
