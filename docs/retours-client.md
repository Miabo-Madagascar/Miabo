# Retours Client — Démo MIABO v1

**Date :** 15 mai 2026
**Source :** Programme SESAME
**Contexte :** Retours reçus suite à la démo de la v1 de la plateforme MIABOxSESAME.

---

## Retours reçus

### 1. Logo SESAME
Insérer et rendre visible le logo du Programme SESAME dans la plateforme de test de personnalité
(branding MIABOxSESAME).
**Fichier image :** fourni en PJ par le client → à placer dans `front/public/logos/sesame.png`.

### 2. Bouton "voir le mot de passe"
Intégrer un bouton toggle de visibilité du mot de passe lors de l'inscription et de la connexion
pour éviter les erreurs de frappe.

### 3. Image illustrative par test
Mettre une image illustrative pour chaque test (VAK, RIASEC, DISC) pour plus d'esthétique.
**Note :** images à fournir par le client.

### 4. Résultats détaillés par test

- **VAK :** Afficher le profil dominant + les scores pour chaque profil.
  Exemple : Profil dominant A — V=12, A=15, K=12.
- **RIASEC :** 3 lettres obligatoires. En cas d'ex-aequo, demander à la personne d'arranger
  l'ordre selon son expérience vécue. Afficher les points + interprétations.
  Exemple : I=14, R=14, C=14.
- **DISC :** Souvent 2 ou 3 lettres. La lettre la plus dominante indique la tendance principale.

### 5. Description du test (textes fournis par le client)

**VAK :**
> "Le test VAK permet d'identifier votre style d'apprentissage dominant : Visuel, Auditif ou
> Kinesthésique, c'est-à-dire la manière dont vous comprenez et retenez le mieux les informations.
> En quelques questions simples, il vous aide à mieux connaître votre mode de fonctionnement
> afin d'adapter vos méthodes d'apprentissage ou de travail."

**RIASEC :**
> "Le test RIASEC permet d'identifier vos intérêts professionnels dominants parmi six profils :
> Réaliste, Investigateur, Artistique, Social, Entreprenant et Conventionnel.
> Il vous aide à mieux comprendre les environnements et activités qui vous correspondent le plus
> pour orienter vos choix d'études ou de carrière."

**DISC :**
> "Le test DISC permet d'identifier votre profil comportemental dominant parmi quatre styles :
> Dominance, Influence, Stabilité et Conformité.
> Il aide à mieux comprendre votre façon de communiquer, de réagir aux situations
> et d'interagir avec les autres."

### 6. Instruction avant chaque test
Afficher avant chaque début de remplissage :
> "Veuillez répondre honnêtement et de manière spontanée. Bon test."

### 7. Plus d'affirmations par profil (en attente des documents PJ)

| Test   | Actuel | Cible | Détail |
|--------|--------|-------|--------|
| VAK    | 12     | 30    | 10 affirmations × 3 profils (V, A, K) |
| RIASEC | 12     | 30    | 5 affirmations × 6 profils (R, I, A, S, E, C) |
| DISC   | 8      | 32    | 8 affirmations × 4 profils (D, I, S, C) |

### 8. Interprétations et conseils
Inclure les interprétations et conseils mentionnés dans les documents fournis en PJ.
**État :** en attente de réception des documents PJ.

### 9. Assistance IA
Après les interprétations, impliquer l'assistance IA.
**État :** à définir avec le client après les étapes précédentes.

---

## Plan d'implémentation

### Étape 1 — Quick wins UX

| Tâche | Statut | Fichiers concernés |
|-------|--------|-------------------|
| Documentation retours client | ✅ | `docs/retours-client.md` |
| Toggle "voir le mot de passe" | ✅ | `PasswordInput.tsx`, `LoginForm.tsx`, `RegisterForm.tsx` |
| Description du test (textes client) | ✅ | `data/vakQuestions.ts`, `data/riasecQuestions.ts`, `data/discQuestions.ts` |
| Instruction avant chaque test | ✅ | `TestLayout.tsx` |
| Logo SESAME | ✅ | `AssessmentDetailClient.tsx` — image à placer dans `public/logos/sesame.png` |
| Refactoring ≤120 lignes | ✅ | `TestLayout.tsx`, `LikertQuestion.tsx` |

### Étape 2 — Structure des tests *(en attente des PJ)*

| Tâche | Statut | Dépendance |
|-------|--------|------------|
| 30 affirmations VAK (10/profil) | ⏳ | Documents PJ client |
| 30 affirmations RIASEC (5/profil) | ⏳ | Documents PJ client |
| 32 affirmations DISC (8/profil) | ⏳ | Documents PJ client |
| Image illustrative par test | ✅ | Illustrations SVG créées (`VakIllustration`, `RiasecIllustration`, `DiscIllustration`) |

### Étape 3 — Logique des résultats

| Tâche | Statut | Notes |
|-------|--------|-------|
| VAK : scores détaillés V / A / K | ⏳ | — |
| RIASEC : 3 lettres + gestion ex-aequo | ⏳ | Interface de classement manuel |
| DISC : profil 2-3 lettres dominantes | ⏳ | — |

### Étape 4 — Interprétations & IA

| Tâche | Statut | Dépendance |
|-------|--------|------------|
| Interprétations VAK par profil | ⏳ | Documents PJ client |
| Interprétations RIASEC par profil | ⏳ | Documents PJ client |
| Interprétations DISC par profil | ⏳ | Documents PJ client |
| Assistance IA | ⏳ | À définir avec le client |
