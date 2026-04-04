/**
 * Types BDD — Sessions & Paiements.
 * Tables : Session, Availability, Payment, EscrowTransaction
 */

import type { EscrowStatus, PaymentMethod, PaymentStatus, SessionStatus } from "./enums"

/** Réservation de tutorat — cycle de statuts complet */
export interface Session {
  id:                 string
  student_id:         string
  tutor_id:           string
  status:             SessionStatus
  subject:            string
  mode:               "online" | "in_person"
  scheduled_at:       string
  duration_minutes:   60 | 90 | 120 | 180
  amount_ariary:      number
  student_objectives: string | null
  tutor_notes:        string | null
  meeting_url:        string | null
  cancelled_by:       string | null
  parent_approved_at: string | null
  created_at:         string
  updated_at:         string
}

/** Créneau de disponibilité tuteur — récurrent ou ponctuel */
export interface Availability {
  id:            string
  tutor_id:      string
  day_of_week:   0 | 1 | 2 | 3 | 4 | 5 | 6 | null
  start_time:    string
  end_time:      string
  is_available:  boolean
  specific_date: string | null
}

/** Transaction Mobile Money — 1 par session */
export interface Payment {
  id:                string
  session_id:        string
  payer_id:          string
  amount_ariary:     number
  commission_ariary: number           // Colonne générée : 10%
  payment_method:    PaymentMethod
  status:            PaymentStatus
  external_ref:      string | null
  phone_number:      string
  created_at:        string
  completed_at:      string | null
}

/** Fonds en séquestre — libérés 24h après la session */
export interface EscrowTransaction {
  id:            string
  payment_id:    string
  tutor_id:      string
  amount_ariary: number
  status:        EscrowStatus
  release_at:    string
  released_at:   string | null
}
