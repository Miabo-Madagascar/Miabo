/**
 * Questions du test DISC — 25 groupes en choix forcé (4 adjectifs par groupe).
 * Clé de scoring : Rouge=D, Jaune=I, Vert=S, Bleu=C (grille officielle PROFIL DISC).
 */

export const DISC_DESCRIPTION =
  "Le test DISC permet d'identifier votre profil comportemental dominant parmi quatre styles : " +
  "Dominance, Influence, Stabilité et Conformité. " +
  "Pour chaque groupe de mots, choisissez celui qui vous ressemble le mieux — " +
  "il n'y a pas de bonne ou mauvaise réponse."

export interface DiscOption { key: "a" | "b" | "c" | "d"; text: string; type: "D" | "I" | "S" | "C" }
export interface DiscChoiceQuestion { id: number; options: DiscOption[] }

/* Maintenu pour compatibilité avec les composants hérités (non utilisé en production) */
export interface DiscQuestion { id: number; text: string; type: "D" | "I" | "S" | "C" }

export const DISC_QUESTIONS: DiscChoiceQuestion[] = [
  { id:  1, options: [{ key:"a", text:"Prudent et réfléchi",              type:"C" }, { key:"b", text:"Loyal et attentif à autrui",        type:"S" }, { key:"c", text:"Influent et démonstratif",        type:"I" }, { key:"d", text:"Stratège et entreprenant",        type:"D" }] },
  { id:  2, options: [{ key:"a", text:"Sociable et familier",             type:"I" }, { key:"b", text:"Honnête et discret",                 type:"S" }, { key:"c", text:"Énergique et orienté résultat",  type:"D" }, { key:"d", text:"Méthodique et logique",           type:"C" }] },
  { id:  3, options: [{ key:"a", text:"Calme et d'humeur égale",          type:"S" }, { key:"b", text:"Déterminé et aimant diriger",         type:"D" }, { key:"c", text:"Enjoué et rayonnant",             type:"I" }, { key:"d", text:"Formaliste et factuel",           type:"C" }] },
  { id:  4, options: [{ key:"a", text:"Sûr de lui et volontaire",         type:"D" }, { key:"b", text:"Ordonné et concis",                  type:"C" }, { key:"c", text:"Familier et stable",              type:"S" }, { key:"d", text:"Loquace et de bonne humeur",      type:"I" }] },
  { id:  5, options: [{ key:"a", text:"Perspicace et impartial",          type:"C" }, { key:"b", text:"Exigeant et direct",                 type:"D" }, { key:"c", text:"Constant et attaché aux valeurs", type:"S" }, { key:"d", text:"Actif et liant",                  type:"I" }] },
  { id:  6, options: [{ key:"a", text:"Accommodant et serviable",         type:"S" }, { key:"b", text:"Plein d'espoir et expressif",         type:"I" }, { key:"c", text:"Puissant et sûr de lui",          type:"D" }, { key:"d", text:"Pensif et maître de soi",         type:"C" }] },
  { id:  7, options: [{ key:"a", text:"Ouvert et persuasif",              type:"I" }, { key:"b", text:"Appliqué et sélectif dans ses relations", type:"S" }, { key:"c", text:"Ferme et entreprenant",        type:"D" }, { key:"d", text:"Posé et analytique",              type:"C" }] },
  { id:  8, options: [{ key:"a", text:"Déterminé et résolu",              type:"D" }, { key:"b", text:"Avenant et jovial",                  type:"I" }, { key:"c", text:"Sensible et amical",              type:"S" }, { key:"d", text:"Logique et correct",              type:"C" }] },
  { id:  9, options: [{ key:"a", text:"Compatissant et diplomate",        type:"S" }, { key:"b", text:"Précis et mesuré",                   type:"C" }, { key:"c", text:"Encourageant et ouvert aux idées", type:"I" }, { key:"d", text:"Orienté résultat et rapidité",   type:"D" }] },
  { id: 10, options: [{ key:"a", text:"Responsable et ferme",             type:"D" }, { key:"b", text:"Réservé et coopératif",              type:"S" }, { key:"c", text:"Expansif et imaginatif",          type:"I" }, { key:"d", text:"Méticuleux et minutieux",         type:"C" }] },
  { id: 11, options: [{ key:"a", text:"Esprit d'équipe et spontané",      type:"I" }, { key:"b", text:"Contrôlé et rationnel",              type:"C" }, { key:"c", text:"Aimable et prévenant",            type:"S" }, { key:"d", text:"Opiniâtre et visant le résultat", type:"D" }] },
  { id: 12, options: [{ key:"a", text:"Analyste et sceptique",            type:"C" }, { key:"b", text:"Amical et divertissant",             type:"I" }, { key:"c", text:"Exigeant et solide",              type:"D" }, { key:"d", text:"Modeste et fidèle",               type:"S" }] },
  { id: 13, options: [{ key:"a", text:"Attaché à ses proches et calme",   type:"S" }, { key:"b", text:"Affectif et confiant",               type:"I" }, { key:"c", text:"Observateur et distant",          type:"C" }, { key:"d", text:"Actif et contrôlant",             type:"D" }] },
  { id: 14, options: [{ key:"a", text:"Volontaire et tenace",             type:"D" }, { key:"b", text:"Conforme et sans parti pris",        type:"C" }, { key:"c", text:"Enthousiaste et attachant",       type:"I" }, { key:"d", text:"Impliqué et consensuel",          type:"S" }] },
  { id: 15, options: [{ key:"a", text:"Formel et à principes",            type:"C" }, { key:"b", text:"Populaire et extraverti",            type:"I" }, { key:"c", text:"Modérateur et apaisant",          type:"S" }, { key:"d", text:"Ferme et tranchant",              type:"D" }] },
  { id: 16, options: [{ key:"a", text:"Animé et persuasif",               type:"I" }, { key:"b", text:"Décideur et pressé",                 type:"D" }, { key:"c", text:"Analytique et discipliné",        type:"C" }, { key:"d", text:"Tolérant et calme",               type:"S" }] },
  { id: 17, options: [{ key:"a", text:"Patient et empathique",            type:"S" }, { key:"b", text:"Logique et mesuré",                  type:"C" }, { key:"c", text:"Orienté résultat et défi",        type:"D" }, { key:"d", text:"Ouvert aux idées et arrangeant",  type:"I" }] },
  { id: 18, options: [{ key:"a", text:"Influent et décontracté",          type:"I" }, { key:"b", text:"Discret et philosophe",              type:"S" }, { key:"c", text:"Réfléchi et circonspect",         type:"C" }, { key:"d", text:"Opiniâtre et déterminé",          type:"D" }] },
  { id: 19, options: [{ key:"a", text:"Axé procédure et bien préparé",    type:"C" }, { key:"b", text:"Courageux et autonome",              type:"D" }, { key:"c", text:"Extraverti et communicatif",      type:"I" }, { key:"d", text:"Bienveillant et de bon conseil",  type:"S" }] },
  { id: 20, options: [{ key:"a", text:"Puissant et clair",                type:"D" }, { key:"b", text:"Spontané et vif",                    type:"I" }, { key:"c", text:"Studieux et raisonné",            type:"C" }, { key:"d", text:"Paisible et aimant l'harmonie",   type:"S" }] },
  { id: 21, options: [{ key:"a", text:"Organisé et prudent",              type:"C" }, { key:"b", text:"Patient et serviable",               type:"S" }, { key:"c", text:"Argumenté et sûr de lui",         type:"D" }, { key:"d", text:"Interactif et ouvert",            type:"I" }] },
  { id: 22, options: [{ key:"a", text:"Indépendant et audacieux",         type:"D" }, { key:"b", text:"Souple et harmonieux",               type:"S" }, { key:"c", text:"Factuel et respectueux des normes", type:"C" }, { key:"d", text:"Aimable et vivant",             type:"I" }] },
  { id: 23, options: [{ key:"a", text:"Démonstratif et enthousiaste",     type:"I" }, { key:"b", text:"Directif et réaliste",               type:"D" }, { key:"c", text:"Compatissant et prévenant",       type:"S" }, { key:"d", text:"Attentif et soucieux du détail",  type:"C" }] },
  { id: 24, options: [{ key:"a", text:"Stable et altruiste",              type:"S" }, { key:"b", text:"Objectif et hardi",                  type:"D" }, { key:"c", text:"Consciencieux et introspectif",   type:"C" }, { key:"d", text:"Sociable et bon vivant",          type:"I" }] },
  { id: 25, options: [{ key:"a", text:"Détaillé et précautionneux",       type:"C" }, { key:"b", text:"Direct et carré",                    type:"D" }, { key:"c", text:"Expressif et radieux",            type:"I" }, { key:"d", text:"Tolérant et ferme",               type:"S" }] },
]
