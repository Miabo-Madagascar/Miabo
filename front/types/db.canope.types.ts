/**
 * Types BDD — CANOPE / COSP / Évaluations.
 * Tables : Assessment, Resource, Review
 */

import type { AssessmentStatus, ResourceType } from "./enums"

/** Scores bruts RIASEC — 6 dimensions */
export interface RiasecScores {
  R: number; I: number; A: number
  S: number; E: number; C: number
}

/** Scores bruts DISC — 4 dimensions */
export interface DiscScores {
  D: number; I: number; S: number; C: number
}

/** Bilan d'orientation VAK/RIASEC/DISC administré par CANOPE/COSP */
export interface Assessment {
  id:                              string
  administered_by:                 string
  student_profile_id:              string | null   // Option A : élève MIABO
  external_young_id:               string | null   // Option B : jeune externe
  external_young_full_name:        string | null   // Nom résolu du jeune
  external_young_date_of_birth:    string | null   // Date de naissance (YYYY-MM-DD)
  external_young_gender:           "M" | "F" | "autre" | null
  external_young_region:           string | null
  external_young_quartier:         string | null
  external_young_school_name:      string | null
  serie:                           "A1" | "A2" | "S" | "OSE" | "C" | "D" | "L" | null
  career_interest:    string | null
  vak_v_score:        number | null   // 0-10
  vak_a_score:        number | null   // 0-9
  vak_k_score:        number | null   // 0-11
  vak_dominant:       "V" | "A" | "K" | null
  riasec_scores:      RiasecScores | null
  riasec_code:        string | null
  disc_scores:        DiscScores | null
  disc_dominant:      "D" | "I" | "S" | "C" | null
  actor_comment:      string | null
  status:             AssessmentStatus
  created_at:         string
  validated_at:       string | null
}

/** Ressource pédagogique certifiée CANOPE — bilingue FR/MG */
export interface Resource {
  id:           string
  publisher_id: string
  title_fr:     string
  title_mg:     string | null
  type:         ResourceType
  subject:      string
  grade_level:  string | null
  file_url:     string | null
  is_premium:   boolean
  is_published: boolean
  created_at:   string
}

/** Avis post-session — modéré avant publication (is_public) */
export interface Review {
  id:          string
  session_id:  string
  reviewer_id: string
  reviewee_id: string
  rating:      1 | 2 | 3 | 4 | 5
  comment:     string | null
  is_public:   boolean
  created_at:  string
}
