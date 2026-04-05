/**
 * Types payload API — Sessions, Paiements, Wallet.
 * Endpoints CDC §3.6 : /api/v1/sessions/, /api/v1/payments/, /api/v1/wallet/
 */

import type { SessionDuration, SessionStatus } from "./enums"
import type { Session } from "./db.sessions.types"
import type { SessionWithParticipants, SessionFull } from "./relations.types"

/** Participant minimal renvoyé par session_to_dict (backend) */
export interface ProfileMini {
  id:         string
  full_name:  string
  avatar_url: string | null
}

/**
 * Réponse de GET /api/v1/sessions/{id} et GET /api/v1/sessions/
 * Correspond à session_to_dict() du service backend.
 */
export interface SessionDetail {
  id:                  string
  status:              SessionStatus
  subject:             string
  mode:                "online" | "in_person"
  scheduled_at:        string
  duration_minutes:    number
  amount_ariary:       number
  student_objectives:  string | null
  tutor_notes:         string | null
  meeting_url:         string | null
  parent_approved_at:  string | null
  created_at:          string | null
  payment_id?:         string | null
  student:             ProfileMini | null
  tutor:               ProfileMini | null
}

/** Réponse générique paginée (pagination curseur — CDC §3.4) */
export interface PaginatedResponse<T> {
  data:        T[]
  cursor:      string | null
  has_more:    boolean
  total_count: number
}

// ── Sessions ──────────────────────────────────────────────────────────────

/** POST /api/v1/sessions — création d'une réservation */
export interface CreateSessionRequest {
  tutor_id:            string
  subject:             string
  mode:                "online" | "in_person"
  scheduled_at:        string
  duration_minutes:    SessionDuration
  student_objectives?: string
}

export interface CreateSessionResponse {
  session:          Session
  requires_payment: boolean
  requires_parent:  boolean
}

/** PUT /api/v1/sessions/{id}/confirm — tuteur accepte ou refuse */
export interface ConfirmSessionRequest {
  accepted: boolean
  reason?:  string
}

/** PUT /api/v1/sessions/{id}/complete — tuteur marque terminée */
export interface CompleteSessionResponse {
  session:           Session
  escrow_release_at: string
}

export type SessionListResponse = PaginatedResponse<SessionWithParticipants>

// ── Paiements ─────────────────────────────────────────────────────────────

/** POST /api/v1/payments/mvola/initiate */
export interface InitiateMvolaRequest {
  session_id:   string
  phone_number: string
}

/** POST /api/v1/payments/orange/initiate */
export interface InitiateOrangeRequest {
  session_id:   string
  phone_number: string
}

export interface InitiatePaymentResponse {
  payment_id:   string
  status:       "pending"
  instructions: string
}

/** POST /api/v1/wallet/withdraw */
export interface WithdrawRequest {
  amount_ariary: number
  phone_number:  string
  method:        "mvola" | "orange_money"
}

export interface WithdrawResponse {
  transaction_id:  string
  amount_ariary:   number
  status:          "processing"
  estimated_delay: string
}

// ── Rapports ──────────────────────────────────────────────────────────────

/** GET /api/v1/reports/monthly/{student_id} */
export interface MonthlyReportResponse {
  student_id:   string
  month:        string
  pdf_url:      string
  generated_at: string
  sessions:     SessionFull[]
  total_hours:  number
  total_ariary: number
}
