/**
 * Types dashboard — statistiques et vues agrégées par rôle.
 * Utilisés par les composants de tableau de bord.
 */

import type { NotificationType } from "./enums"
import type { Notification }     from "./db.messaging.types"

// ── Centre de notifications ────────────────────────────────────────────────

export interface NotificationCenter {
  unread_count:  number
  notifications: Notification[]
  by_type:       Partial<Record<NotificationType, number>>
}

// ── Stats élève ────────────────────────────────────────────────────────────

export interface StudentDashboardStats {
  student_id:          string
  total_sessions:      number
  completed_sessions:  number
  total_hours:         number
  total_ariary_spent:  number
  average_rating_given: number | null
  upcoming_sessions:   number
  subjects_studied:    string[]
}

// ── Stats tuteur ───────────────────────────────────────────────────────────

export interface TutorDashboardStats {
  tutor_id:              string
  total_sessions:        number
  completed_sessions:    number
  total_hours:           number
  total_ariary_earned:   number
  wallet_balance:        number
  average_rating:        number | null
  pending_escrow_amount: number
  upcoming_sessions:     number
}

// ── Stats parent ───────────────────────────────────────────────────────────

export interface ParentDashboardStats {
  parent_id:        string
  children_count:   number
  children_stats:   StudentDashboardStats[]
  total_ariary_spent: number
  pending_approvals:  number
}

// ── Stats admin plateforme ─────────────────────────────────────────────────

export interface AdminPlatformStats {
  total_users:          number
  active_tutors:        number
  total_sessions_month: number
  total_revenue_month:  number
  commission_month:     number
  pending_validations:  number
  active_escrow_amount: number
  new_registrations_7d: number
}
