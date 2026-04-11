# CONVENTIONS.md — MIABO v2

Règles de code applicables à l'ensemble du projet (front + back).
Toute contribution doit respecter ces conventions.

---

## 1. Règles universelles

| Règle | Valeur |
|---|---|
| Longueur max par fichier | **120 lignes** |
| Langue des commentaires | **Français** |
| Langue du code (vars, fonctions) | **Anglais** |
| Langue des messages utilisateur | **Français + Malgache (i18n)** |

---

## 2. TypeScript (front)

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `TutorCard.tsx` |
| Hook custom | camelCase + `use` | `useSessions.ts` |
| Fichier utilitaire | camelCase | `formatAriary.ts` |
| Champ de type BDD | snake_case | `student_profile_id` |
| Champ de type TS interne | camelCase | `isLoading` |
| Constante globale | SCREAMING_SNAKE | `MAX_SESSION_DURATION` |
| Enum TS | PascalCase valeurs | `UserRole.tutor` |

### Types

- Activer `strict: true` dans `tsconfig.json` — aucun `any`
- `string | null` pour les champs nullable (jamais `undefined` pour le BDD)
- Toujours importer depuis `@/types` — jamais depuis les fichiers individuels
- Les interfaces BDD (snake_case) restent distinctes des props React (camelCase)

### Composants

- Props typées avec une interface locale `interface Props { … }`
- Pas de logique métier dans les composants — tout dans les hooks
- Variantes via CVA importées depuis `@/themes/default`
- Import de tokens uniquement via `@/lib/theme` ou variables CSS

### Structure d'un fichier composant

```tsx
// 1. Imports externes
// 2. Imports internes (@/types, @/lib, @/components)
// 3. Interface Props
// 4. Composant (export named, pas default)
// 5. Export
```

---

## 3. Python (back)

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichier | snake_case | `tutor_profiles.py` |
| Classe SQLAlchemy | PascalCase | `TutorProfile` |
| Schéma Pydantic | PascalCase + suffixe | `CreateSessionRequest` |
| Fonction / variable | snake_case | `get_current_user` |
| Constante | SCREAMING_SNAKE | `ESCROW_DELAY_HOURS` |
| Router prefix | kebab-case | `/api/v1/tutor-profiles` |

### SQLAlchemy / Alembic

- Toutes les colonnes nullable en DB → `nullable=True` en Python
- Colonnes générées → `sa.Computed(...)` + `persisted=True`
- Contraintes CHECK nommées : `chk_<table>_<description>`
- Indexes nommés : `ix_<table>_<colonne>`
- Toute modification de schéma → nouvelle révision Alembic (jamais modifier une révision existante)

### FastAPI

- Un router par domaine dans `src/routers/`
- Dépendances dans `src/dependencies.py` : `get_db()`, `get_current_user()`, `require_role(*roles)`
- Logique métier dans `src/services/` — les routers ne font que valider + déléguer
- Réponse d'erreur : `HTTPException(status_code=..., detail="message en français")`

---

## 4. Base de données

### Nommage PostgreSQL

| Élément | Convention | Exemple |
|---|---|---|
| Table | snake_case pluriel | `tutor_profiles` |
| Colonne | snake_case | `wallet_balance` |
| Index | `ix_<table>_<col>` | `ix_sessions_student_id` |
| Contrainte CHECK | `chk_<table>_<desc>` | `chk_sessions_duration` |
| Politique RLS | `<table>_<role>_<action>` | `sessions_student_select` |
| Enum PostgreSQL | snake_case | `user_role`, `session_status` |
| Trigger | `trg_<table>_<event>` | `trg_sessions_updated_at` |

### Règles RLS

- Toutes les tables ont RLS activé + `FORCE ROW LEVEL SECURITY`
- Pas de bypass côté front — toujours `auth.uid()` comme ancre
- Les opérations admin/service utilisent la `service_role` key côté FastAPI uniquement

---

## 5. API REST

- Préfixe : `/api/v1/`
- Pagination curseur : `?cursor=<opaque>&limit=<n>` — réponse `PaginatedResponse<T>`
- Erreurs : `{ "detail": "message" }` (standard FastAPI)
- Auth : header `Authorization: Bearer <supabase_jwt>`
- Webhooks paiement : `/api/webhooks/mvola` et `/api/webhooks/orange` (Next.js Route Handlers)

---

## 6. Git

- Branches : `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commits : `type(scope): description en français` — ex: `feat(sessions): ajout confirmation tuteur`
- Types valides : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
- Pas de commit direct sur `main` — toujours PR
