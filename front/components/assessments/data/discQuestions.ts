/**
 * Questions du test DISC — 16 affirmations, 4 par profil (D, I, S, C).
 */

export const DISC_DESCRIPTION =
  "Le test DISC permet d'identifier votre profil comportemental dominant parmi quatre styles : " +
  "Dominance, Influence, Stabilité et Conformité. " +
  "Il aide à mieux comprendre votre façon de communiquer, de réagir aux situations " +
  "et d'interagir avec les autres."

export interface DiscQuestion {
  id:   number
  text: string
  type: "D" | "I" | "S" | "C"
}

export const DISC_QUESTIONS: DiscQuestion[] = [
  { id: 1,  text: "Je suis direct et j'aime relever des nouveaux défis.",         type: "D" },
  { id: 2,  text: "Je suis enthousiaste et j'aime convaincre les autres.",        type: "I" },
  { id: 3,  text: "Je suis patient et j'apprécie la stabilité au travail.",       type: "S" },
  { id: 4,  text: "Je suis précis et j'aime suivre les règles établies.",         type: "C" },
  { id: 5,  text: "Je prends des décisions rapides, même sous pression.",         type: "D" },
  { id: 6,  text: "J'aime animer des réunions et faire des présentations.",       type: "I" },
  { id: 7,  text: "Je suis un bon auditeur et j'évite les conflits.",             type: "S" },
  { id: 8,  text: "Je vérifie toujours mon travail plusieurs fois.",              type: "C" },
  { id: 9,  text: "Quand un obstacle surgit, je fonce pour le contourner.",       type: "D" },
  { id: 10, text: "J'arrive vite à mettre les autres à l'aise.",                  type: "I" },
  { id: 11, text: "Je préfère un cadre stable à un changement brutal.",           type: "S" },
  { id: 12, text: "J'aime classer, organiser et structurer l'information.",       type: "C" },
  { id: 13, text: "Diriger une équipe me motive plus qu'exécuter une tâche.",     type: "D" },
  { id: 14, text: "Je raconte volontiers des histoires pour illustrer mes idées.", type: "I" },
  { id: 15, text: "Mes amis savent qu'ils peuvent compter sur moi sur la durée.",  type: "S" },
  { id: 16, text: "Je m'appuie sur des faits avant de prendre une décision.",     type: "C" },
]
