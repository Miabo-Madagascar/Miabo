/**
 * Types de relations — jointures courantes entre tables BDD.
 * Utilisés pour les réponses API enrichies (SELECT avec JOIN).
 */

import type { Profile, StudentProfile, TutorProfile, CanopProfile } from "./db.users.types"
import type { Session, Payment }                                      from "./db.sessions.types"
import type { Assessment }                                             from "./db.canope.types"
import type { Message, Conversation }                                  from "./db.messaging.types"

// ── Profils enrichis ───────────────────────────────────────────────────────

export interface StudentWithProfile {
  profile:         Profile
  student_profile: StudentProfile
}

export interface TutorWithProfile {
  profile:       Profile
  tutor_profile: TutorProfile
}

export interface CanopWithProfile {
  profile:      Profile
  canop_profile: CanopProfile
}

// ── Sessions enrichies ─────────────────────────────────────────────────────

export interface SessionWithParticipants {
  session: Session
  student: Pick<Profile, "id" | "full_name" | "avatar_url">
  tutor:   Pick<Profile, "id" | "full_name" | "avatar_url">
}

export interface SessionWithPayment {
  session: Session
  payment: Payment | null
}

export interface SessionFull extends SessionWithParticipants {
  payment:    Payment | null
  assessment: Assessment | null
}

// ── Tutor card — résumé public pour le matching ───────────────────────────

/** Correspond à la réponse de GET /api/v1/tutors/search et /tutors/{id} */
export interface TutorCard {
  id:               string
  full_name:        string
  avatar_url:       string | null
  slug:             string | null
  bio:              string | null
  subjects:         string[]
  grade_levels:     string[]
  hourly_rate:      number
  teaching_methods: string[]
  location:         string | null
  avg_rating:       number
  total_sessions:   number
  canope_certified: boolean
}

/** Profil complet retourné par GET /api/v1/profiles/me */
export interface FullProfile {
  id:                 string
  email:              string
  full_name:          string
  role:               string
  phone:              string | null
  avatar_url:         string | null
  preferred_language: "fr" | "mg"
  is_active:          boolean
  created_at:         string | null
  student_profile:    StudentProfile | null
  tutor_profile:      TutorProfile | null
}

// ── Messagerie enrichie ────────────────────────────────────────────────────

export interface MessageWithMeta extends Message {
  sender: Pick<Profile, "id" | "full_name" | "avatar_url">
  reads:  string[]          // user_ids ayant lu
  reactions: { emoji: string; user_ids: string[] }[]
}

export interface ConversationWithPreview {
  conversation:    Conversation
  participants:    Pick<Profile, "id" | "full_name" | "avatar_url">[]
  last_message:    MessageWithMeta | null
  unread_count:    number
}

export interface AssessmentWithSubject extends Assessment {
  student_name: string | null
  administered_by_name: string
}
