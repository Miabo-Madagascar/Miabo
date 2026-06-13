/**
 * Enums TypeScript — miroir exact des types PostgreSQL ENUM.
 * Utilisés dans les types de tables, les composants et les appels API.
 * Toute modification ici doit être répercutée dans back/src/models/enums.py
 */

/** 6 rôles utilisateur définis dans le CDC §1.3 */
export enum UserRole {
  Student = "student",
  Tutor   = "tutor",
  Parent  = "parent",
  Admin   = "admin",
  Canope  = "canope",
  Cosp    = "cosp",
}

/** Cycle de validation d'un profil tuteur — CDC §MATCH-002 */
export enum TutorStatus {
  Pending   = "pending",
  Validated = "validated",
  Rejected  = "rejected",
  Suspended = "suspended",
}

/** Cycle de vie complet d'une session — CDC §RES */
export enum SessionStatus {
  PendingParent = "pending_parent",
  PendingTutor  = "pending_tutor",
  Confirmed     = "confirmed",
  InProgress    = "in_progress",
  Completed     = "completed",
  Cancelled     = "cancelled",
  Disputed      = "disputed",
}

/** Statuts d'une transaction Mobile Money — CDC §PAY */
export enum PaymentStatus {
  Pending    = "pending",
  Processing = "processing",
  Completed  = "completed",
  Failed     = "failed",
  Refunded   = "refunded",
}

/** Statuts d'un fonds en séquestre — CDC §PAY */
export enum EscrowStatus {
  Held     = "held",
  Released = "released",
  Disputed = "disputed",
  Refunded = "refunded",
}

/** Cycle d'un bilan d'orientation — CDC §COSP */
export enum AssessmentStatus {
  Draft             = "draft",
  InProgress        = "in_progress",
  PendingValidation = "pending_validation",
  Validated         = "validated",
}

/** Types de messages — CDC §MSG */
export enum MessageType {
  Text   = "text",
  Image  = "image",
  File   = "file",
  System = "system",
}

/** Types de notifications — CDC §NOTIF */
export enum NotificationType {
  SessionRequest = "session_request",
  Payment        = "payment",
  Message        = "message",
  Review         = "review",
  System         = "system",
}

/** Types de ressources pédagogiques CANOPE — CDC §CANOPE */
export enum ResourceType {
  Pdf      = "pdf",
  Video    = "video",
  Audio    = "audio",
  Quiz     = "quiz",
  Exercise = "exercise",
}

/** Types de conversations — CDC §MSG */
export enum ConversationType {
  StudentTutor = "student_tutor",
  ParentTutor  = "parent_tutor",
}

/** Méthodes de paiement Mobile Money — CDC §PAY */
export enum PaymentMethod {
  Mvola       = "mvola",
  OrangeMoney = "orange_money",
  Wallet      = "wallet",
}

/** Profils dominants des tests d'orientation */
export enum VakDominant   { V = "V", A = "A", K = "K" }
export enum DiscDominant  { D = "D", I = "I", S = "S", C = "C" }

/** Durées de session autorisées en minutes — CDC §RES */
export type SessionDuration = 60 | 90 | 120 | 180

/** Langues supportées — CDC §i18n */
export type SupportedLocale = "fr" | "mg"

/** Niveaux scolaires — CDC §4.1 student_profiles.grade_level */
export enum GradeLevel {
  Sixieme   = "6eme",
  Cinquieme = "5eme",
  Quatrieme = "4eme",
  Troisieme = "3eme",
  Seconde   = "2nde",
  Premiere  = "1ere",
  Terminale = "Tle",
  Superieur = "superieur",
}

/** Réactions emoji autorisées sur les messages */
export type AllowedEmoji = "👍" | "❤️" | "😂" | "😮" | "😢" | "🙏"
