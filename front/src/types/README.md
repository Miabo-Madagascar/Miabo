# types/

Types TypeScript partagés — toujours importer depuis `@/types`.

## Fichiers

| Fichier | Contenu |
|---|---|
| `enums.ts` | Toutes les unions littérales et enums partagées |
| `db.users.types.ts` | Profile, StudentProfile, TutorProfile, CanopProfile… |
| `db.sessions.types.ts` | Session, Availability, Payment, EscrowTransaction |
| `db.canope.types.ts` | Assessment, Resource, Review, RiasecScores, DiscScores |
| `db.messaging.types.ts` | Conversation, Message, Notification… |
| `relations.types.ts` | Jointures courantes (SessionFull, TutorCard…) |
| `dashboard.types.ts` | Stats par rôle (StudentDashboardStats, AdminPlatformStats…) |
| `api.sessions.types.ts` | Payloads sessions, paiements, wallet, rapports |
| `api.auth.types.ts` | Payloads auth, profils, matching tuteurs |
| `api.canope.types.ts` | Payloads CANOPE, messagerie, avis, analytics |
| `index.ts` | Re-export unique — seul point d'entrée |

## Conventions

- snake_case pour les champs BDD (convention Supabase)
- `string | null` pour les champs nullable (jamais `undefined`)
- Limite stricte : 120 lignes par fichier
