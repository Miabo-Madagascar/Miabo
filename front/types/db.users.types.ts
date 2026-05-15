/**
 * Types BDD — domaine Auth & Utilisateurs.
 * Tables : Profile, StudentProfile, TutorProfile, CanopProfile,
 *          ParentStudentLink, ExternalYoungProfile
 */

import type { GradeLevel, TutorStatus, UserRole } from "./enums"

/** Table hub centrale — liée à auth.users Supabase */
export interface Profile {
  id:                 string
  role:               UserRole
  full_name:          string
  email:              string
  phone:              string | null
  avatar_url:         string | null
  preferred_language: "fr" | "mg"
  is_active:          boolean
  created_at:         string
  updated_at:         string
}

/** Données métier élève — profils VAK/RIASEC/DISC */
export interface StudentProfile {
  id:              string
  profile_id:      string
  grade_level:     GradeLevel
  school_name:     string | null
  serie:           "L" | "S" | null
  date_of_birth:   string | null
  vak_visual:      number | null      // 0-10
  vak_auditory:    number | null      // 0-9
  vak_kinesthetic: number | null      // 0-11
  vak_dominant:    "V" | "A" | "K" | null
  riasec_code:     string | null      // 2 caractères ex: "SI"
  disc_profile:    "D" | "I" | "S" | "C" | null
  subjects_needed: string[]
  location:        string | null
}

/** Données métier tuteur — tarifs, certification, wallet */
export interface TutorProfile {
  id:                string
  profile_id:        string
  validation_status: TutorStatus
  bio:               string | null
  subjects:          string[]
  grade_levels:      GradeLevel[]
  hourly_rate:       number           // Ariary, min 2000
  teaching_methods:  string[]
  location:          string | null
  avg_rating:        number           // 0.00-5.00
  total_sessions:    number
  canope_certified:  boolean
  kyc_verified:      boolean
  wallet_balance:    number           // Ariary
  slug:              string | null
  updated_at:        string
}

/** Type de profil CANOPE/COSP dans le système éducatif */
export type CanopProfileType = "etudiant" | "tuteur" | "parent" | "autre"

/** Données acteurs CANOPE et COSP — identifiés par code SESAME */
export interface CanopProfile {
  id:                  string
  profile_id:          string
  sesame_code:         string
  first_name:          string
  last_name:           string
  date_of_birth:       string
  gender:              "M" | "F" | "autre"
  address:             string | null     // Adresse postale
  city:                string
  region:              string
  phone:               string
  profession:          string
  profile_type:        CanopProfileType | null  // Étudiant / Tuteur / Parent / Autre
  profile_other:       string | null            // Précision si profile_type = 'autre'
  education_level:     string | null
  cosp_training_dates: string[]
  is_cosp:             boolean
  created_at:          string
}

/** Lien parent ↔ enfant — PK composite */
export interface ParentStudentLink {
  parent_id:    string
  student_id:   string
  relationship: "parent" | "tuteur_legal" | "autre"
  verified:     boolean
  created_at:   string
}

/** Jeune externe sans compte MIABO — créé par CANOPE/COSP (Option B) */
export interface ExternalYoungProfile {
  id:              string
  created_by:      string
  full_name:       string
  date_of_birth:   string
  gender:          "M" | "F" | "autre"
  region:          string
  quartier:        string | null
  serie:           "L" | "S" | null
  school_name:     string | null
  career_interest: string | null
  created_at:      string
}
