/**
 * Point d'entrée des types TypeScript — re-exporte tout depuis un seul import.
 *
 * Usage :
 *   import type { Profile, TutorCard, UserRole, CreateSessionRequest } from "@/types"
 */

// Enums et valeurs littérales partagées
export * from "./enums"

// Types des tables BDD (snake_case — convention Supabase)
export * from "./db.users.types"
export * from "./db.sessions.types"
export * from "./db.canope.types"
export * from "./db.messaging.types"

// Types de relations (jointures courantes)
export * from "./relations.types"
export * from "./dashboard.types"

// Types de payloads API FastAPI
export * from "./api.sessions.types"
export * from "./api.auth.types"
export * from "./api.canope.types"
