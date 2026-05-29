/**
 * Données du test VAK — 30 affirmations officielles SESAME/BOE.
 * Textes exacts du document "Test-VAKOG- Style d'apprentissage.pdf".
 * Adaptées au format Likert 1-5 (la formulation reste identique).
 * Clé de scoring : V=Q1,7,8,9,14,16,19,24,28,30 | A=Q2,3,6,11,12,15,20,23,25,27 | K=Q4,5,10,13,17,18,21,22,26,29
 */

export const VAK_DESCRIPTION =
  "Ce test a pour objectif de vous aider à prendre conscience de votre manière d'appréhender le monde " +
  "environnant, y compris sur le plan scolaire. Répondez à chaque affirmation en indiquant dans quelle " +
  "mesure elle vous correspond."

export interface VakQuestion {
  id:   number
  text: string
  type: "V" | "A" | "K"
}

export const VAK_QUESTIONS: VakQuestion[] = [
  { id:  1, text: "Vous vous préoccupez beaucoup de votre aspect extérieur.",                                                type: "V" },
  { id:  2, text: "Vous aimez assister à des concerts.",                                                                     type: "A" },
  { id:  3, text: "On vous accuse parfois de trop parler.",                                                                  type: "A" },
  { id:  4, text: "Vous aimez vivre dehors.",                                                                                type: "K" },
  { id:  5, text: "En écoutant la musique, vous ne pouvez vous empêcher de battre la mesure.",                              type: "K" },
  { id:  6, text: "Vous préférez demander votre chemin pour vous repérer dans une ville inconnue.",                         type: "A" },
  { id:  7, text: "Vous avez besoin d'un plan pour vous repérer dans une ville inconnue.",                                  type: "V" },
  { id:  8, text: "Vous aimez que votre chambre soit impeccable.",                                                           type: "V" },
  { id:  9, text: "Vous aimez lire des livres et des magazines.",                                                            type: "V" },
  { id: 10, text: "Vous aimez faire de l'exercice physique.",                                                                type: "K" },
  { id: 11, text: "Il vous arrive souvent de vous parler à vous-même.",                                                     type: "A" },
  { id: 12, text: "Vous aimez écouter des interviews à la radio.",                                                           type: "A" },
  { id: 13, text: "Vous aimez caresser des animaux.",                                                                        type: "K" },
  { id: 14, text: "Vous préférez recevoir des consignes de travail écrites plutôt qu'orales.",                              type: "V" },
  { id: 15, text: "Vous préférez faire une conférence plutôt qu'écrire un article.",                                        type: "A" },
  { id: 16, text: "Quand vous faites de la cuisine, vous suivez de près la recette.",                                        type: "V" },
  { id: 17, text: "Dans la journée, vous avez souvent besoin de vous lever de votre chaise.",                               type: "K" },
  { id: 18, text: "Vous aimez travailler de vos mains, construire des choses.",                                              type: "K" },
  { id: 19, text: "Vous gardez souvent une trace écrite de ce que vous faites.",                                             type: "V" },
  { id: 20, text: "Vous devinez beaucoup de la personne en entendant sa voix.",                                              type: "A" },
  { id: 21, text: "Vous attachez beaucoup d'importance à la façon dont quelqu'un vous serre la main.",                     type: "K" },
  { id: 22, text: "Vous préférez pratiquer un sport plutôt que le regarder à la télévision.",                               type: "K" },
  { id: 23, text: "Vous préférez écouter les nouvelles à la radio plutôt que de les lire dans le journal.",                type: "A" },
  { id: 24, text: "Vous admirez souvent les photos utilisées en publicité.",                                                 type: "V" },
  { id: 25, text: "Lorsque vous devez dormir ailleurs que chez vous, vous êtes très sensible aux bruits nouveaux.",         type: "A" },
  { id: 26, text: "En fermant les yeux, vous reconnaissez facilement les objets au toucher.",                               type: "K" },
  { id: 27, text: "Vous aimez avoir un fond musical pour travailler.",                                                       type: "A" },
  { id: 28, text: "Vous êtes plus sensible aux images du clip vidéo qu'à la musique qui l'accompagne.",                    type: "V" },
  { id: 29, text: "C'est souvent le contact du tissu sur la peau qui vous décide à choisir un vêtement.",                 type: "K" },
  { id: 30, text: "Vous attachez beaucoup d'importance à la décoration de votre chambre.",                                  type: "V" },
]
