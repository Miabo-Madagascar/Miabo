# Plan — Module RH (recrutement & onboarding tuteurs)

> Backlog agile validé le 2026-08-16, à recopier dans Trello
> (https://trello.com/b/SGf27WWZ). Périmètre : Epics 0 à 3 (rôle RH, fiche
> candidat, cycle de vie, bilan de personnalité, activation en compte réel).
> Le sync vers le matching et l'algorithme lui-même sont hors périmètre de ce
> tour (voir section dédiée en fin de document).

## Contexte

MIABO va recruter un grand nombre de tuteurs. Un nouveau rôle **RH** doit disposer
d'un espace dédié pour digitaliser leur recrutement : enregistrer les données du
tuteur (spécialité, localisation, personnalité...) avant même qu'il ait un compte
sur la plateforme, le faire progresser dans un cycle de vie, puis l'activer comme
vrai tuteur MIABO. Ces données alimenteront plus tard un algorithme de matching
élève↔tuteur (façon Uber) — **hors périmètre de ce tour**, traité séparément.

Décision de cadrage (validée) : on reste concentré sur le **module RH complet et
bien fini** — une vraie brique de MVP, avec une UX soignée — plutôt que d'avancer
en surface sur plusieurs modules à la fois.

---

## Contraintes techniques découvertes

1. **`tutor_profiles.profile_id` est `NOT NULL`**, FK vers `profiles.id` → `auth.users.id`
   (Supabase Auth). Un `TutorProfile` ne peut pas exister sans compte réel, et aucun
   système d'invitation/claim n'existe aujourd'hui. → La fiche RH est une table de
   **staging séparée** (`tutor_candidates`), pas un insert direct dans `tutor_profiles`.
2. **`Assessment` a un XOR binaire strict** en DB (`chk_subject_exclusive` : soit
   `student_profile_id` soit `external_young_id`). L'ajouter pour les candidats tuteurs
   demande une migration qui recrée cette contrainte en XOR à 3 branches.
3. **Le trigger Postgres `handle_new_user()`** (`back/alembic/versions/0003_auth_user_trigger.py`)
   crée aujourd'hui un `tutor_profiles` avec `validation_status = 'validated'` **dès
   l'inscription**, ce qui court-circuiterait un cycle RH piloté si non corrigé (Epic 3).
4. **`REGISTRABLE_ROLES = {student, tutor, parent}`** (`back/src/schemas/auth.py` L9) —
   `rh` doit être provisionné par un admin, jamais auto-inscriptible (même logique que
   `canope`/`cosp`).
5. **Aucun composant `Table`/`DataTable` générique n'existe** — chaque liste
   (`AssessmentListClient.tsx`, `CanopeDashboardRecentBilans.tsx`) est un tableau/grid
   codé à la main. On suit ce même pattern pour la vue table RH.
6. **Aucune librairie drag-and-drop n'est installée** (`front/package.json` ne contient
   ni `dnd-kit` ni équivalent). La vue Kanban nécessite d'ajouter `@dnd-kit/core` +
   `@dnd-kit/sortable` comme nouvelle dépendance — **à valider explicitement avant
   implémentation**, ce n'est pas anodin.
7. **L'espace CANOPE n'est pas internationalisé** (tout le texte est en français en dur,
   `fr.json`/`mg.json` n'ont pas de namespace `canope`). C'est un raccourci pris à
   l'époque, contraire à la règle absolue #7 du CLAUDE.md. **Pour un vrai MVP soigné,
   le module RH doit suivre la règle correctement** : nouveau namespace `rh` dans les
   deux fichiers de messages dès le départ, pas de texte en dur.

---

## Composants et patterns existants à réutiliser (pas à réinventer)

| Besoin | Réutiliser |
|---|---|
| Layout dashboard + StatCards | `front/components/dashboard/DashboardStats.tsx` (grid StatCards + Recharts) |
| Nav par rôle | `front/components/dashboard/Sidebar.tsx` (`ROLE_ROOT`, `MENU_ITEMS[].roles`) |
| Badge de statut | `tutorStatusVariants` dans `front/themes/default/index.ts` L49-54 — même pattern pour un nouveau `tutorCandidateStatusVariants` |
| Boutons d'action (valider/rejeter) | `PendingTutorsClient.tsx` — carte + boutons `Approuver`/`Rejeter` avec état de chargement par item |
| Formulaire de création d'une fiche pour un "sujet" externe | `AssessmentWizard.tsx` + `ExternalYoungForm.tsx` — pattern exact pour "créer une fiche avant même que la personne ait un compte" |
| Liste filtrable/triable | `AssessmentListClient.tsx` + `AssessmentFilters.tsx` |
| Page détail + bilan de personnalité | `AssessmentDetailClient.tsx` + tout `front/components/canope/bilan/*` (`BilanHeader`, `BilanTestCard`, `BilanAside`, `BilanSynthesis`, `BilanAiSuggestion`, `bilanMeta.ts`) — **confirmés 100% génériques**, typés sur `Assessment`, aucune logique hardcodée "élève" |
| Champs profil tuteur (specialité, tarif, méthodes) | `front/components/dashboard/TutorProfileSection.tsx` — base de champs pour le formulaire candidat |

Cette réutilisation garantit une UX cohérente avec le reste de la plateforme (mêmes
tokens, mêmes composants) sans surcoût de design.

---

## Backlog

### Epic 0 — Fondations du rôle `rh`

- **US-01** — En tant qu'admin, je veux provisionner un compte utilisateur avec le rôle `rh`.
- **US-02** — En tant que RH, je veux accéder à mon propre espace dashboard après connexion,
  avec une vue d'ensemble de mon pipeline de recrutement (KPIs).

Tâches :
- Ajouter `rh` à `UserRole` (`back/src/models/enums.py`, `front/types/enums.ts`).
- Migration Alembic isolée : `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'rh'`
  (⚠️ doit être seule dans sa migration Alembic — Postgres interdit d'utiliser une
  nouvelle valeur d'enum dans la transaction qui l'ajoute).
- RLS : helper `is_rh()` (même pattern que `is_admin()`/`is_canope_or_cosp()` dans
  `back/alembic/versions/0002_rls_policies.py` L27-42).
- Nouveau router `back/src/routers/rh.py`, dépendance `require_role(UserRole.rh)`,
  wiring dans `back/main.py`.
- Frontend : `front/app/[locale]/(dashboard)/rh/page.tsx` (accueil), entrée `ROLE_ROOT`
  + `MENU_ITEMS` dans `Sidebar.tsx`, `ROLE_TO_PATH` dans `dashboard/page.tsx`.
- Dashboard home RH : StatCards (nb candidats par statut, taux de conversion
  candidat→actif, temps moyen d'activation) sur le modèle de `DashboardStats.tsx`,
  + liste des 5 derniers candidats mis à jour (modèle `CanopeDashboardRecentBilans.tsx`).
- Nouveau namespace `rh` dans `front/messages/fr.json` + `mg.json`.

---

### Epic 1 — Fiche candidat tuteur & cycle de vie

- **US-03** — En tant que RH, je veux créer une fiche pour un tuteur recruté (identité,
  contact, spécialité/matières, niveaux, localisation, tarif envisagé, résultat et
  notes d'entretien) sans que celui-ci ait de compte.
- **US-04** — En tant que RH, je veux faire évoluer le statut d'un candidat
  (Candidat → Validé → Formé → Actif → Inactif).
- **US-05** — En tant que RH, je veux visualiser mes candidats en tableau **ou** en
  kanban par statut, avec recherche et filtres (spécialité, localisation, statut).

#### Modèle de données

- Nouvelle table `tutor_candidates` (migration Alembic) : `id`, `created_by`
  (FK → `profiles.id`, le RH auteur), `full_name`, `phone`, `email`, `subjects`,
  `grade_levels`, `location`, `desired_hourly_rate`, `interview_score`,
  `interview_notes`, `training_completed` (bool), `status`, `status_reason`
  (texte optionnel — motif si passage à "Inactif"), `invited_at` (nullable, rempli
  en Epic 3), `linked_profile_id` (nullable, rempli à l'activation), `created_at`,
  `updated_at`.
- Nouvel enum `TutorCandidateStatus` : `candidate, validated, trained, active, inactive`.
  Distinct du `TutorStatus` existant (`pending/validated/rejected/suspended`), qui
  reste dédié à la validation publique du profil tuteur une fois actif.
- **Règle de transition** : `inactive` atteignable depuis n'importe quel statut (avec
  `status_reason` recommandé) ; les autres transitions suivent l'ordre linéaire mais
  un retour en arrière reste possible (ex : échec formation → retour "Validé"), avec
  confirmation UI pour tout mouvement qui n'est pas une progression normale.
- RLS : lecture/écriture réservée à `is_rh()` (+ `is_admin()` en lecture).

#### API

- Service + router `back/src/routers/rh.py` : CRUD `/rh/tutor-candidates`,
  endpoint dédié `PUT /rh/tutor-candidates/{id}/status` (transition contrôlée,
  valide les enchaînements côté serveur plutôt qu'un simple update de champ).

#### UX / Frontend

- `front/app/[locale]/(dashboard)/rh/candidats/page.tsx` — liste avec **toggle
  Table ↔ Kanban** (préférence persistée en `localStorage`, même logique que le
  collapse de la Sidebar) :
  - **Vue table** : reprend `AssessmentListClient.tsx` + `AssessmentFilters.tsx`
    (recherche, filtre statut/spécialité/localisation, tri), colonnes nom / spécialité
    / localisation / statut (badge `tutorCandidateStatusVariants`) / date / actions.
  - **Vue kanban** : 5 colonnes (une par statut), cartes au format `PendingTutorsClient`
    (nom, chips matières, localisation, score entretien), drag-and-drop entre colonnes
    = changement de statut (confirmation si régression ou passage à "Inactif").
    Nouvelle dépendance `@dnd-kit/core` + `@dnd-kit/sortable`.
- `front/app/[locale]/(dashboard)/rh/candidats/nouveau/page.tsx` — formulaire
  mono-page (pattern `AssessmentWizard.tsx`), champs repris de
  `TutorProfileSection.tsx` (matières, niveaux, tarif, localisation) + bloc
  identité/contact + bloc entretien (score, notes, case "formation suivie").
- `front/app/[locale]/(dashboard)/rh/candidats/[candidateId]/page.tsx` — détail :
  header identité + badge statut, boutons de transition de statut (pattern boutons
  `PendingTutorsClient`), panneau infos (pattern `BilanAside`), historique des
  changements de statut. Édition en place ou lien vers le formulaire pré-rempli.
- États à soigner explicitement (vrai MVP = pas de placeholders) : chargement
  (skeleton, déjà pattern `animate-pulse` dans `PendingTutorsClient`), liste vide
  (déjà pattern "Aucun tuteur en attente"), erreur réseau, confirmation avant
  passage à "Inactif".

---

### Epic 2 — Bilan de personnalité du candidat (RIASEC/DISC/VAK)

- **US-06** — En tant que RH, je veux faire passer/enregistrer un bilan RIASEC/DISC/VAK
  pour un candidat tuteur, avec le même parcours que celui déjà construit pour les élèves.

Tâches :
- Migration : FK nullable `tutor_candidate_id` sur `Assessment` (→ `tutor_candidates.id`),
  `chk_subject_exclusive` réécrite en XOR à 3 branches
  (`student_profile_id` / `external_young_id` / `tutor_candidate_id`).
- Réutiliser tel quel `assessment_common.py` (scoring 100% générique) ; étendre
  `assessment_to_dict()` avec une 3e branche pour résoudre `tutor_candidate_full_name`.
- Nouveau service `back/src/services/tutor_candidate_assessments.py`, mirroring
  `assessment_tests.py` (le RH administre pour le compte du candidat — pattern
  `CreateAssessmentRequest`, pas le flow "self" élève).
- RLS : étendre policies `assessments_*` pour le cas `tutor_candidate_id` + `is_rh()`.
- Frontend : `front/app/[locale]/(dashboard)/rh/candidats/[candidateId]/bilan/page.tsx`
  réutilisant **directement** `AssessmentDetailClient.tsx` et tout `bilan/*`
  (aucun nouveau composant de test à écrire — seule la résolution du "sujet" change).
  Intégré comme section/onglet de la page détail candidat (Epic 1), pas une page isolée
  déconnectée du reste du dossier.

---

### Epic 3 — Activation du compte tuteur (candidat → compte réel)

- **US-07** — En tant que RH, une fois un candidat "Formé" et son bilan complété, je veux
  l'inviter à activer son compte MIABO, avec ses données déjà pré-remplies.
- **US-08** — En tant que candidat invité, je veux activer mon compte via un lien reçu
  par email et retrouver mon profil déjà pré-rempli par le RH.

Tâches :
- Corriger `handle_new_user()` pour ne plus forcer `validation_status = 'validated'`
  aveuglément à l'inscription tuteur.
- Bouton "Inviter à activer son compte" sur la fiche candidat (visible seulement si
  statut = "Formé" + bilan complété) → déclenche une invitation Supabase (lien
  magique), enregistre `invited_at`. Statut candidat reste "Formé" avec badge
  "Invitation envoyée le [date]" tant que le compte n'est pas activé.
- Service de fusion côté backend : à la création réelle du compte (webhook/callback
  Supabase ou vérif au premier login), créer la vraie ligne `tutor_profiles` en copiant
  `subjects`, `location`, `desired_hourly_rate`, etc. depuis `tutor_candidates`, lier
  `linked_profile_id`, faire pointer le bilan (Epic 2) vers le `tutor_profile_id` réel,
  passer `tutor_candidates.status = 'active'`.
- Écran de confirmation candidat côté frontend (parcours d'activation) : accueil +
  confirmation que le profil est bien pré-rempli, avant redirection dashboard tuteur.

---

## Hors périmètre de ce tour (pour mémoire, backlog séparé)

Ces deux epics dépendent des données produites par le module RH mais ne sont **pas**
traités maintenant :

- **Sync Assessment → profil tuteur** (dénormalisation `riasec_code`/`disc_profile`/
  `vak_dominant` sur `tutor_profiles`, actuellement inexistante même côté élève).
- **Algorithme de matching MATCH-003** (score 40% style + 25% matières + 20% dispo +
  15% note), actuellement un stub `TODO PHASE 2` dans `back/src/services/matching.py`,
  avec des bugs déjà présents (`average_rating` au lieu de `avg_rating`,
  `tutor.riasec_code` inexistant sur `TutorProfile`) à corriger quand ce chantier
  démarrera.

---

## Notes pour l'import Trello

- Chaque **Epic** (0 à 3) → une liste Trello. Chaque **User Story** → une carte,
  tâches associées en checklist.
- Ordre de dépendance strict : **Epic 0 → Epic 1 → Epic 2 → Epic 3**
  (Epic 2 a besoin de la table `tutor_candidates` d'Epic 1 ; Epic 3 a besoin du bilan
  complété d'Epic 2 comme condition d'activation).
- Décision à valider explicitement avant de coder l'Epic 1 : ajout de la dépendance
  `@dnd-kit` pour la vue kanban.
- Respecter les règles absolues CLAUDE.md pendant l'implémentation : 120 lignes/fichier
  max, commentaires en français, migrations Alembic uniquement, RLS systématique,
  textes via `messages/*.json` (pas de raccourci comme sur l'espace CANOPE), une
  feature = une branche = une PR.

## Vérification

- Tests unitaires backend par service (pattern `back/tests/test_services_*.py` +
  factories `back/tests/assessment_factories.py`, à étendre avec une factory
  `tutor_candidate`).
- `alembic upgrade head` puis `alembic downgrade -1` sur chaque migration pour valider
  la réversibilité (attention particulière à la migration d'ajout de valeur d'enum).
- Parcours manuel de bout en bout : RH crée un candidat → fait passer le bilan →
  fait progresser le statut jusqu'à "Formé" → invite → le candidat active son compte
  → vérifier l'apparition d'un vrai `tutor_profiles` avec les données pré-remplies.
