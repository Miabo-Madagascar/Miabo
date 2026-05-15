export interface TestProfile { letter: string; name: string; tone: string }
export interface TestMeta {
  id:        "vak" | "riasec" | "disc"
  title:     string
  subtitle:  string
  abstract:  string
  module:    string
  duration:  string
  questions: number
  profiles:  TestProfile[]
}

export const TESTS_META: Record<"vak" | "riasec" | "disc", TestMeta> = {
  vak: {
    id: "vak",
    title: "Profil VAK", subtitle: "Styles d'apprentissage",
    abstract: "Découvrez comment vous mémorisez et apprenez le mieux : par l'image, l'écoute ou le mouvement.",
    module: "Module 1 / 3", duration: "4 min", questions: 12,
    profiles: [
      { letter: "V", name: "Visuel",        tone: "#7c3aed" },
      { letter: "A", name: "Auditif",       tone: "#0891b2" },
      { letter: "K", name: "Kinesthésique", tone: "#ea580c" },
    ],
  },
  riasec: {
    id: "riasec",
    title: "Test RIASEC", subtitle: "Intérêts professionnels",
    abstract: "Identifiez parmi six grands profils ceux qui correspondent à vos centres d'intérêt et environnements de travail préférés.",
    module: "Module 2 / 3", duration: "5 min", questions: 12,
    profiles: [
      { letter: "R", name: "Réaliste",      tone: "#a16207" },
      { letter: "I", name: "Investigateur", tone: "#1e40af" },
      { letter: "A", name: "Artistique",    tone: "#be185d" },
      { letter: "S", name: "Social",        tone: "#15803d" },
      { letter: "E", name: "Entreprenant",  tone: "#b91c1c" },
      { letter: "C", name: "Conventionnel", tone: "#475569" },
    ],
  },
  disc: {
    id: "disc",
    title: "Test DISC", subtitle: "Profil comportemental",
    abstract: "Comprenez votre manière de communiquer, de décider et d'interagir en groupe parmi quatre styles dominants.",
    module: "Module 3 / 3", duration: "5 min", questions: 16,
    profiles: [
      { letter: "D", name: "Dominance",  tone: "#dc2626" },
      { letter: "I", name: "Influence",  tone: "#d97706" },
      { letter: "S", name: "Stabilité",  tone: "#16a34a" },
      { letter: "C", name: "Conformité", tone: "#2450ed" },
    ],
  },
}
