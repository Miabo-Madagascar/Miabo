/**
 * Types payload API — Auth, Profils, Matching tuteurs.
 * Endpoints CDC §3.6 : /api/v1/auth/, /api/v1/profiles/, /api/v1/tutors/
 */

import type { UserRole } from "./enums"
import type { TutorCard } from "./relations.types"

// ── Auth ───────────────────────────────────────────────────────────────────

/** POST /api/v1/auth/register */
export interface RegisterRequest {
  email:      string
  password:   string
  full_name:  string
  role:       Extract<UserRole, "student" | "tutor" | "parent">
  phone?:     string
  locale?:    "fr" | "mg"
}

/** PUT /api/v1/profiles/me */
export interface UpdateProfileRequest {
  full_name?:   string
  phone?:       string
  avatar_url?:  string
  bio?:         string
  locale?:      "fr" | "mg"
}

/** PUT /api/v1/profiles/tutor */
export interface UpdateTutorProfileRequest {
  subjects?:        string[]
  hourly_rate?:     number
  education_level?: string
  description?:     string
  is_online_ok?:    boolean
  is_in_person_ok?: boolean
  zones?:           string[]
}

// ── Matching tuteurs ───────────────────────────────────────────────────────

/** GET /api/v1/tutors/search */
export interface TutorSearchParams {
  subject?:        string
  max_rate?:       number
  mode?:           "online" | "in_person"
  zone?:           string
  grade_level?:    string
  riasec_code?:    string
  cursor?:         string
  limit?:          number
}

export interface TutorSearchResponse {
  tutors:      TutorCard[]
  cursor:      string | null
  has_more:    boolean
  total_count: number
}

// ── Score de compatibilité RIASEC ──────────────────────────────────────────

/** POST /api/v1/tutors/{id}/compatibility */
export interface CompatibilityScoreRequest {
  student_riasec_code: string
}

export interface CompatibilityScoreResponse {
  tutor_id:    string
  score:       number        // 0-100
  common_dims: string[]      // lettres communes ex: ["R","I"]
}

// ── Validation tuteur (admin/CANOPE) ───────────────────────────────────────

/** PUT /api/v1/admin/tutors/{id}/validate */
export interface ValidateTutorRequest {
  status:   "validated" | "rejected"
  comment?: string
}
