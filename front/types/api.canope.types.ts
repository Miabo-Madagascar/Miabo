/**
 * Types payload API — CANOPE/COSP, Ressources, Messagerie, Avis.
 * Endpoints CDC §3.6 : /api/v1/assessments/, /api/v1/resources/, /api/v1/reviews/
 */

import type { ResourceType } from "./enums"
import type { Resource, Review } from "./db.canope.types"
import type { Notification }  from "./db.messaging.types"

// ── Évaluations orientation ────────────────────────────────────────────────

/** GET /api/v1/assessments/stats */
export interface AssessmentStats {
  total:           number
  draft:           number
  in_progress:     number
  validated:       number
  this_month:      number
  completion_rate: number   // pourcentage 0-100
}

/** POST /api/v1/assessments */
export interface CreateAssessmentRequest {
  external_young_full_name: string
  serie?:                   "A1" | "A2" | "S" | "OSE" | "C" | "D" | "L"
  career_interest?:         string
}

export interface SubmitVakRequest {
  v_score: number   // 0-10
  a_score: number   // 0-9
  k_score: number   // 0-11
}

export interface SubmitRiasecRequest {
  R: number; I: number; A: number
  S: number; E: number; C: number
}

export interface SubmitDiscRequest {
  D: number; I: number; S: number; C: number
}

export interface ValidateAssessmentRequest {
  comment?: string
}

export interface AssessmentResponse {
  assessment_id: string
  riasec_code:   string | null
  vak_dominant:  "V" | "A" | "K" | null
  disc_dominant: "D" | "I" | "S" | "C" | null
  recommended_tutors: string[]    // tutor_ids
}

// ── Ressources pédagogiques ────────────────────────────────────────────────

export interface ResourceSearchParams {
  type?:        ResourceType
  subject?:     string
  grade_level?: string
  is_premium?:  boolean
  cursor?:      string
  limit?:       number
}

export interface ResourceListResponse {
  resources:   Resource[]
  cursor:      string | null
  has_more:    boolean
  total_count: number
}

// ── Messagerie ─────────────────────────────────────────────────────────────

export interface SendMessageRequest {
  conversation_id: string
  content:         string
  message_type?:   "text" | "file"
  file_url?:       string
}

export interface ConversationListResponse {
  conversations: {
    id:              string
    participant_ids: string[]
    last_message_at: string
    unread_count:    number
  }[]
}

// ── Notifications ──────────────────────────────────────────────────────────

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count:  number
}

export interface MarkNotificationsReadRequest {
  notification_ids: string[]
}

// ── Avis post-session ──────────────────────────────────────────────────────

export interface CreateReviewRequest {
  session_id:  string
  reviewee_id: string
  rating:      1 | 2 | 3 | 4 | 5
  comment?:    string
}

export interface ReviewResponse {
  review:          Review
  new_avg_rating:  number
}

// ── Analytics admin/tuteur ─────────────────────────────────────────────────

export interface TutorAnalyticsResponse {
  tutor_id:        string
  period:          string
  sessions_count:  number
  hours_total:     number
  revenue_ariary:  number
  avg_rating:      number | null
  top_subjects:    string[]
}
