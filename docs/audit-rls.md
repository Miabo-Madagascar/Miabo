# Audit RLS — MIABO v2

**Date :** 2026-04-06  
**Migration auditée :** `0002_rls_policies.py`  
**Tables vérifiées :** 19/19 ✅

---

## Résumé

Toutes les 19 tables ont RLS activé (`ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`).  
Les politiques couvrent SELECT, INSERT, UPDATE, DELETE selon les rôles et relations métier.

---

## Fonctions helper PostgreSQL

| Fonction | Rôle | Sécurité |
|---|---|---|
| `is_admin()` | Vérifie le rôle admin via `profiles` | SECURITY DEFINER ✅ |
| `is_canope_or_cosp()` | Vérifie les rôles CANOPE/COSP | SECURITY DEFINER ✅ |
| `is_active_tutor_of(uuid)` | Tuteur actif pour cet élève | SECURITY DEFINER ✅ |
| `is_verified_parent_of(uuid)` | Parent lié et vérifié | SECURITY DEFINER ✅ |
| `current_user_role()` | Retourne le rôle de l'utilisateur courant | SECURITY DEFINER ✅ |

---

## Politiques par table

### Données profils

| Table | SELECT | INSERT | UPDATE | DELETE | Observations |
|---|---|---|---|---|---|
| `profiles` | propre profil + admin | — (trigger Supabase Auth) | propre profil + admin | — (CASCADE auth.users) | ✅ |
| `student_profiles` | propre + parent lié + tuteur actif + admin/canope | propre uid | propre uid + admin | — | ✅ |
| `tutor_profiles` | validé=public, sinon propre + admin + canope | propre uid | propre uid + admin + canope | — | ✅ |
| `canope_profiles` | propre uid + admin | propre uid | propre uid + admin | — | ⚠️ Pas de DELETE (voulu) |
| `parent_student_links` | parent + élève + admin | parent uid | admin uniquement | parent + admin | ✅ |
| `external_young_profiles` | créateur canope + admin | is_canope_or_cosp() | créateur canope + admin | admin | ✅ |

### Sessions & disponibilités

| Table | SELECT | INSERT | UPDATE | DELETE | Observations |
|---|---|---|---|---|---|
| `sessions` | élève + tuteur + parent lié + admin | élève + parent lié | tuteur + parent + élève + admin | — (audit trail) | ✅ |
| `availabilities` | public (matching) | tuteur propriétaire | tuteur propriétaire | tuteur propriétaire | ✅ |

### Paiements

| Table | SELECT | INSERT | UPDATE | DELETE | Observations |
|---|---|---|---|---|---|
| `payments` | payeur + tuteur bénéficiaire + admin | payeur uid | admin (webhooks FastAPI) | — | ✅ |
| `escrow_transactions` | tuteur + admin | admin (service_role FastAPI) | admin | — | ✅ |

### CANOPE/Ressources

| Table | SELECT | INSERT | UPDATE | DELETE | Observations |
|---|---|---|---|---|---|
| `assessments` | acteur créateur + élève + admin | is_canope_or_cosp() | acteur si status != validated + admin | admin | ✅ |
| `resources` | publiées=public, sinon publisher + admin/canope | is_canope_or_cosp() + publisher | publisher + admin | publisher + admin | ✅ |
| `reviews` | publics=tous, sinon reviewer + reviewee + admin | participant session complétée | admin | — | ✅ |

### Messagerie

| Table | SELECT | INSERT | UPDATE | DELETE | Observations |
|---|---|---|---|---|---|
| `conversations` | participants + admin | — (service_role FastAPI) | participants | — | ⚠️ Pas d'INSERT direct (intentionnel) |
| `conversation_participants` | membres de la conv + admin | admin (service_role) | — | propre uid + admin | ✅ |
| `messages` | participants + admin | participant + sender = uid | sender + admin (soft delete) | — | ✅ |
| `message_reads` | propre uid + admin | propre uid + participant | — | — | ✅ |
| `message_reactions` | participants conv | propre uid + participant | — | propre uid | ✅ |
| `notifications` | propre uid | admin (service_role) | propre uid | — | ✅ |

---

## Points d'attention

1. **`conversations` — pas d'INSERT RLS** : Intentionnel. Les conversations sont créées via FastAPI avec `service_role_key` qui bypasse RLS. Les utilisateurs ne peuvent pas créer de conversations directement en SQL.

2. **`canope_profiles` — pas de DELETE** : Intentionnel. Les profils CANOPE/COSP ne doivent pas être supprimés en cascade (données historiques).

3. **`payments` / `escrow_transactions` — UPDATE admin-only** : Les mises à jour de statut de paiement passent par les webhooks Mobile Money gérés par FastAPI (service_role). Jamais directement par l'utilisateur.

4. **`sessions` — pas de DELETE** : Intentionnel pour l'audit trail. Les sessions annulées ont `status = 'cancelled'`.

5. **`profiles` — pas d'INSERT RLS** : L'insertion est gérée par le trigger Supabase Auth (`on_auth_user_created`). Les insertions directes SQL sont bloquées.

---

## Recommandations Phase 6

- [ ] Activer les politiques RLS via `alembic upgrade head` sur l'env de production
- [ ] Tester les politiques en Supabase Dashboard > Authentication > Policies (mode test)
- [ ] Vérifier que le `service_role_key` est configuré côté FastAPI (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Auditer les Edge Functions Supabase si utilisées (hors scope actuel)
- [ ] Activer les logs d'audit PostgreSQL pour surveiller les tentatives d'accès bloquées
