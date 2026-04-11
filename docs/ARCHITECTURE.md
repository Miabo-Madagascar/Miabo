# ARCHITECTURE.md — MIABO v2

Vue d'ensemble technique de la plateforme MIABO Madagascar.

---

## 1. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 16 |
| Langage front | TypeScript strict | 5 |
| Styles | Tailwind CSS v4 + CSS tokens | 4 |
| Backend | FastAPI | 0.115+ |
| Langage back | Python | 3.10+ |
| ORM | SQLAlchemy | 2.x |
| Migrations | Alembic | 1.x |
| Base de données | PostgreSQL (Supabase) | 15 |
| Auth | Supabase Auth (JWT) | — |
| Realtime | Supabase Realtime | — |
| Stockage fichiers | Supabase Storage | — |
| i18n | next-intl | — |
| PWA | next-pwa | — |

---

## 2. Vue d'ensemble des composants

```
┌─────────────────────────────────────────────────────────┐
│                      Navigateur                          │
│  Next.js App Router (SSR + Client Components)            │
│  Supabase JS SDK  ←──→  Supabase Auth / Realtime         │
└────────────────┬────────────────────────────────────────┘
                 │ REST (JWT)
                 ▼
┌─────────────────────────────────────────────────────────┐
│               FastAPI  (/api/v1/*)                        │
│  routers/ → services/ → SQLAlchemy ORM                   │
│  APScheduler (libération escrow)                         │
└────────────────┬────────────────────────────────────────┘
                 │ psycopg2
                 ▼
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL 15 (Supabase)                         │
│  RLS activé sur 19 tables                                │
│  ENUM types, triggers updated_at, escrow logic           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Authentification et autorisation

### Flux d'authentification

1. L'utilisateur s'authentifie via **Supabase Auth** (email/password)
2. Supabase retourne un **JWT signé** contenant `sub` (UUID utilisateur) et `role`
3. Le frontend stocke le JWT via `supabase-js` (cookie HttpOnly côté Server Components)
4. Les appels FastAPI passent `Authorization: Bearer <jwt>`
5. FastAPI vérifie le JWT avec la clé publique Supabase (`SUPABASE_JWT_SECRET`)
6. La dépendance `get_current_user()` extrait l'UUID et le rôle

### Rôles

| Rôle | Accès |
|---|---|
| `student` | Ses sessions, son profil, messagerie, paiements |
| `tutor` | Ses sessions, disponibilités, wallet, messagerie |
| `parent` | Sessions de ses enfants liés, paiements |
| `canope` | Évaluations orientation, ressources pédagogiques |
| `cosp` | Idem canope + accès jeunes externes |
| `admin` | Accès total, validation tuteurs, analytics |

### RLS (Row Level Security)

- Toutes les tables : `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`
- Ancre : `auth.uid()` = UUID du JWT Supabase
- Les opérations système (escrow, notifications) passent par la **service_role key** côté FastAPI uniquement — jamais exposée au front

---

## 4. Structure des données

### Domaines et tables

```
Auth & Profils (6 tables)
  profiles, student_profiles, tutor_profiles,
  canop_profiles, parent_student_links, external_young_profiles

Sessions & Disponibilités (2 tables)
  sessions, availabilities

Paiements (2 tables)
  payments, escrow_transactions

CANOPE/COSP (3 tables)
  assessments, resources, reviews

Messagerie (3 tables)
  conversations, conversation_participants, messages

Notifications (3 tables)
  message_reads, message_reactions, notifications
```

### Relations clés

- `profiles.id` → `auth.users.id` (FK vers Supabase Auth, non géré par Alembic)
- `sessions.student_id` + `sessions.tutor_id` → `profiles.id`
- `payments.session_id` → `sessions.id` (1:1)
- `escrow_transactions.payment_id` → `payments.id` (1:1)
- `assessments` : XOR entre `student_profile_id` et `external_young_id`

---

## 5. Flux de paiement (escrow)

```
1. Étudiant initie paiement → FastAPI crée Payment (status: pending)
2. FastAPI appelle MVola/Orange API → retourne transaction_id
3. Webhook MVola/Orange → Next.js Route Handler → FastAPI confirme
4. Payment passe en (status: completed)
5. EscrowTransaction créée (status: held, release_at = now + 48h)
6. APScheduler libère l'escrow à release_at
7. wallet_balance tuteur += amount - commission (10%)
```

---

## 6. Realtime (messagerie & notifications)

- Abonnement Supabase Realtime sur `messages` et `notifications` côté client
- Les hooks `useMessages` et `useNotifications` gèrent les canaux
- RLS garantit que chaque utilisateur ne reçoit que ses propres données
- FastAPI insère via service_role → Realtime notifie les abonnés autorisés

---

## 7. Internationalisation (i18n)

- Bibliothèque : `next-intl`
- Locales supportées : `fr` (défaut), `mg` (Malgache)
- Fichiers de traduction : `front/messages/fr.json` + `front/messages/mg.json`
- Middleware Next.js détecte la locale depuis l'URL (`/fr/...` ou `/mg/...`)
- Les messages d'erreur API (FastAPI) restent en français côté serveur

---

## 8. PWA & cache

| Stratégie | Ressources |
|---|---|
| Network First | Pages dynamiques, données API |
| Cache First | Assets statiques (images, fonts) |
| Stale-While-Revalidate | Catalogue tuteurs, ressources pédagogiques |
| Background Sync | Envoi de messages hors-ligne |

---

## 9. Décisions d'architecture notables

| Décision | Justification |
|---|---|
| Alembic (pas Supabase CLI migrations) | FastAPI/SQLAlchemy est la source de vérité du schéma |
| RLS côté PostgreSQL (pas uniquement FastAPI) | Défense en profondeur — même si l'API est compromise, les données restent protégées |
| Escrow 48h via APScheduler | Permet la résolution de litiges avant libération des fonds |
| Tokens CSS + `@theme` Tailwind v4 | Découplage design/code, support dark mode natif, thème premium possible |
| Types TS séparés du schéma BDD | Les interfaces BDD (snake_case) ne fuient pas dans les props React |
| Limite 120 lignes/fichier | Force la séparation des responsabilités, facilite les revues de code |
