# MIABO — Contexte projet

MIABO est une plateforme de tutorat scolaire bilingue (FR/MG) pour Madagascar.
Elle met en relation des élèves avec des tuteurs certifiés CANOPE, gère les réservations,
les paiements Mobile Money (MVola + Orange Money) via un système d'escrow,
et intègre des tests d'orientation scolaire (VAK, RIASEC, DISC) pilotés par les conseillers CANOPE/COSP.
Le projet est en cours de développement (v2) — la v1 était un mock localStorage.

**Stack** : Next.js 16 (App Router) · FastAPI 0.115+ · Supabase (PostgreSQL 15 + Auth + Realtime + Storage) · Python 3.10+ · SQLAlchemy + Alembic · Tailwind CSS v4 · TypeScript strict · next-intl (FR/MG) · next-pwa

**6 rôles utilisateurs** :
| Rôle | Description |
|---|---|
| `student` (Élève) | Recherche tuteurs, réserve sessions, passe tests d'orientation |
| `tutor` (Tuteur) | Gère son agenda, reçoit paiements via escrow, se certifie CANOPE |
| `parent` | Suit les enfants liés, valide/paie les sessions |
| `admin` | Accès total, validation tuteurs, analytics plateforme, gestion litiges |
| `canope` | Administre bilans d'orientation, publie ressources pédagogiques |
| `cosp` | Comme CANOPE + accès aux jeunes externes (non scolarisés) |

---

## Fichiers de référence

| Fichier | Rôle |
|---|---|
| `cdc_miabo_v2_FULL.html` | CDC complet — **lire avant toute nouvelle feature** |
| `CONVENTIONS.md` | Règles de code (nommage, structure, TypeScript, Python, Git) |
| `docs/ARCHITECTURE.md` | Vue d'ensemble technique, flux de données, décisions d'archi |
| `docs/database-schema.drawio` | Schéma BDD — 19 tables, relations, cardinalités |
| `front/types/index.ts` | Point d'entrée des types TypeScript partagés |
| `front/types/enums.ts` | Tous les enums TS (UserRole, SessionStatus, etc.) |
| `back/src/models/__init__.py` | Point d'entrée des modèles SQLAlchemy |
| `back/alembic/versions/` | Historique des migrations BDD |

---

## Arborescence du projet

```
Miabo/
├── front/                    # Next.js 16 App Router
│   ├── app/
│   │   ├── [locale]/         # i18n routing (fr / mg)
│   │   │   ├── (public)/     # Landing, auth (non protégé)
│   │   │   └── (dashboard)/  # Dashboards par rôle (protégé)
│   │   │       ├── eleve/
│   │   │       ├── tuteur/
│   │   │       ├── parent/
│   │   │       ├── admin/
│   │   │       ├── canope/
│   │   │       └── cosp/
│   ├── components/           # ui/ dashboard/ matching/ messaging/ payment/
│   ├── hooks/                # Hooks React custom (useAuth, useSessions…)
│   ├── lib/
│   │   ├── supabase/         # client.ts (browser) + server.ts (SSR)
│   │   ├── api/              # client.ts — wrapper fetch() FastAPI
│   │   └── utils/            # cn(), formatters
│   ├── messages/             # fr.json + mg.json (next-intl)
│   ├── stores/               # messageStore.ts + notificationStore.ts
│   ├── styles/               # tokens.css — variables CSS design tokens
│   ├── themes/default/       # Variantes CVA (buttons, badges…)
│   ├── types/                # Types TS partagés (11 fichiers ≤120 lignes)
│   └── middleware.ts         # Auth guard + locale detection
├── back/                     # FastAPI
│   ├── main.py               # App + inclusion des 12 routers
│   ├── src/
│   │   ├── config/database.py
│   │   ├── dependencies.py   # get_db(), get_current_user(), require_role()
│   │   ├── models/           # SQLAlchemy ORM (9 fichiers par domaine)
│   │   ├── routers/          # 12 routers : auth, profiles, tutors, sessions…
│   │   ├── schemas/          # Pydantic v2 (auth, sessions, payments, common)
│   │   └── services/         # Logique métier (sessions, escrow, matching…)
│   └── alembic/              # Migrations BDD
│       └── versions/
│           ├── 0001_initial_schema.py   # 19 tables + ENUMs + indexes
│           └── 0002_rls_policies.py     # RLS sur 19 tables
└── docs/
    ├── ARCHITECTURE.md
    ├── database-schema.drawio
    └── README.md
```

---

## Commandes utiles

```bash
# Frontend
cd front
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run test       # TODO : configurer Jest/Vitest

# Backend
cd back
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp env.sample .env   # remplir DATABASE_URL + SUPABASE_JWT_SECRET
uvicorn main:app --reload   # http://localhost:8000
# Swagger UI : http://localhost:8000/docs

# Migrations BDD (Alembic — PAS supabase db push)
cd back
alembic upgrade head                               # Appliquer toutes les migrations
alembic revision --autogenerate -m "description"   # Générer une révision
alembic downgrade -1                               # Reculer d'une révision

# Tests (à configurer)
cd back && pytest
```

---

## Règles absolues — respectées dans CHAQUE session

1. **Lire le CDC** (`cdc_miabo_v2_FULL.html`) avant toute nouvelle feature
2. **TypeScript strict** — zéro `any`, zéro `@ts-ignore`, zéro `as unknown`
3. **Max 120 lignes par fichier** — découper si dépassement
4. **Principes SOLID** — une classe/fonction = une responsabilité
5. **Commenter en français** — code en anglais, commentaires en français
6. **Tests avec le code** — chaque service/router livré avec ses tests
7. **Jamais de valeur hardcodée** — couleurs via `tokens.css`, textes via `messages/*.json`
8. **Une feature = une branche = une PR** — jamais de commit direct sur `main`
9. **Migrations Alembic uniquement** — ne jamais modifier le schéma BDD manuellement
10. **RLS toujours actif** — toute nouvelle table doit avoir ses politiques RLS

---

## Conventions de nommage (résumé)

| Élément | Convention |
|---|---|
| Composant React | `PascalCase.tsx` |
| Hook custom | `useXxx.ts` |
| Fichier TS utilitaire | `camelCase.ts` |
| Champ BDD / type TS BDD | `snake_case` |
| Props React internes | `camelCase` |
| Router FastAPI | `snake_case` (fichier) + `/kebab-case` (URL) |
| Branche Git | `feat/slug`, `fix/slug`, `chore/slug` |
| Commit | `feat(scope): description en français` |

---

## État d'avancement — PHASE 0 TERMINÉE

| Phase | Contenu | Statut |
|---|---|---|
| **Phase 0** | Fondations (migrations, types TS, tokens, arborescence, conventions) | ✅ **TERMINÉ** |
| **Phase 1** | Auth & profils (Supabase Auth, middleware, LoginForm, RegisterForm, useAuth) | ✅ **TERMINÉ** |
| **Phase 2** | Profils & dashboards (TutorCard, matching, disponibilités, dashboards rôles) | 🔲 À FAIRE |
| **Phase 3** | Sessions & CANOPE (réservations, bilans orientation VAK/RIASEC/DISC, ressources) | 🔲 À FAIRE |
| **Phase 4** | Paiements (MVola + Orange Money, escrow, wallet tuteur) | 🔲 À FAIRE |
| **Phase 5** | Messagerie (Supabase Realtime, Zustand stores, notifications push) | 🔲 À FAIRE |
| **Phase 6** | QA & lancement (tests E2E Playwright, audit RLS, PDF rapports, optimisation) | 🔲 À FAIRE |

---

## Proxy API — règle absolue

Le front n'appelle **jamais** FastAPI directement.
Tous les appels passent par le proxy Next.js défini dans `front/next.config.ts` :

```
Navigateur → /api/backend/:path*
                  ↓ (next.config.ts, côté serveur)
             ${API_URL}/api/v1/:path*   (FastAPI)
```

- Utiliser `api.get/post/put/delete()` depuis `@/lib/api/client` — jamais `fetch()` brut vers FastAPI
- Ne **jamais** créer de variable `NEXT_PUBLIC_API_URL` — l'URL backend est serveur uniquement
- `lib/api/client.ts` utilise `/api/backend` comme base (URL relative)

---

## Variables d'environnement requises

```bash
# back/.env (basé sur back/env.sample)
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_JWT_SECRET="[Legacy JWT Secret — Settings > JWT Keys > Legacy JWT Secret tab]"
# Note : Supabase utilise ECC (P-256) / ES256. FastAPI vérifie d'abord via JWKS,
# puis fallback HS256 avec SUPABASE_JWT_SECRET si SUPABASE_URL est renseigné.
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key"

# front/.env.local (basé sur front/.env.local.example)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"   # navigateur — SDK Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre-anon-key"       # navigateur — clé publique safe
API_URL="http://localhost:8000"                       # SERVEUR uniquement — jamais NEXT_PUBLIC_
```
