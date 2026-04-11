"""Politiques Row Level Security — toutes les tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-04 01:00:00

Logique : Supabase fournit auth.uid() pour identifier l'utilisateur courant.
Chaque table a RLS activé. Aucune donnée n'est accessible sans politique
explicite. Les fonctions helper évitent la duplication des sous-requêtes.
"""

from typing import Sequence, Union
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ---------------------------------------------------------------------------
# Fonctions helper PostgreSQL
# Centralisent la logique de rôle pour éviter la duplication dans les policies
# ---------------------------------------------------------------------------

_HELPER_FUNCTIONS = """
-- Vérifie si l'uid courant a le rôle 'admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- Vérifie si l'uid courant est un acteur CANOPE ou COSP
CREATE OR REPLACE FUNCTION is_canope_or_cosp()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('canope', 'cosp') AND is_active = true
  );
$$;

-- Vérifie si l'uid courant est tuteur avec session active pour cet élève
-- Utilisé pour la protection des données des mineurs
CREATE OR REPLACE FUNCTION is_active_tutor_of(p_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM sessions
    WHERE tutor_id = auth.uid()
      AND student_id = p_student_id
      AND status IN ('confirmed', 'in_progress')
  );
$$;

-- Vérifie si l'uid courant est parent lié et vérifié pour cet élève
CREATE OR REPLACE FUNCTION is_verified_parent_of(p_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_student_links
    WHERE parent_id = auth.uid()
      AND student_id = p_student_id
      AND verified = true
  );
$$;

-- Retourne le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::text FROM profiles
  WHERE id = auth.uid() AND is_active = true;
$$;
"""

_DROP_HELPER_FUNCTIONS = """
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_canope_or_cosp();
DROP FUNCTION IF EXISTS is_active_tutor_of(uuid);
DROP FUNCTION IF EXISTS is_verified_parent_of(uuid);
DROP FUNCTION IF EXISTS current_user_role();
"""


def _enable_rls(table: str) -> None:
    """Active RLS et révoque l'accès public par défaut."""
    op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
    op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")


def _policy(table: str, name: str, cmd: str, using: str = "",
            check: str = "") -> None:
    """Crée une politique RLS avec USING et/ou WITH CHECK."""
    sql = f"CREATE POLICY \"{name}\" ON {table} FOR {cmd}"
    if using:
        sql += f" USING ({using})"
    if check:
        sql += f" WITH CHECK ({check})"
    op.execute(sql)


def _drop_policy(table: str, name: str) -> None:
    op.execute(f'DROP POLICY IF EXISTS "{name}" ON {table}')


# ---------------------------------------------------------------------------
# upgrade()
# ---------------------------------------------------------------------------

def upgrade() -> None:
    op.execute(_HELPER_FUNCTIONS)

    # ── profiles ─────────────────────────────────────────────────────────
    _enable_rls("profiles")

    # Chaque utilisateur voit son propre profil ; admin voit tout
    _policy("profiles", "profiles_select", "SELECT",
            using="id = auth.uid() OR is_admin()")

    # Mise à jour de son propre profil uniquement (admin peut modifier n'importe qui)
    _policy("profiles", "profiles_update", "UPDATE",
            using="id = auth.uid() OR is_admin()",
            check="id = auth.uid() OR is_admin()")

    # INSERT géré par trigger Supabase Auth — bloqué en direct
    # DELETE géré par CASCADE depuis auth.users — bloqué en direct

    # ── student_profiles ──────────────────────────────────────────────────
    _enable_rls("student_profiles")

    # Élève : son propre profil
    # Parent lié et vérifié : profil de son enfant
    # Tuteur avec session active : profil de l'élève concerné
    # Admin / CANOPE / COSP : tout
    _policy("student_profiles", "student_profiles_select", "SELECT", using="""
      profile_id = auth.uid()
      OR is_verified_parent_of(profile_id)
      OR is_active_tutor_of(profile_id)
      OR is_admin()
      OR is_canope_or_cosp()
    """)

    # Seul l'élève peut créer son propre profil
    _policy("student_profiles", "student_profiles_insert", "INSERT",
            check="profile_id = auth.uid()")

    # Élève modifie son propre profil ; admin peut modifier
    _policy("student_profiles", "student_profiles_update", "UPDATE",
            using="profile_id = auth.uid() OR is_admin()",
            check="profile_id = auth.uid() OR is_admin()")

    # ── tutor_profiles ────────────────────────────────────────────────────
    _enable_rls("tutor_profiles")

    # Profil validé = visible par tous
    # Profil non validé = visible uniquement par le tuteur + admin + canope/cosp
    _policy("tutor_profiles", "tutor_profiles_select", "SELECT", using="""
      validation_status = 'validated'
      OR profile_id = auth.uid()
      OR is_admin()
      OR is_canope_or_cosp()
    """)

    _policy("tutor_profiles", "tutor_profiles_insert", "INSERT",
            check="profile_id = auth.uid()")

    # Tuteur : ses propres infos (bio, tarif, disponibilités)
    # Admin / CANOPE : validation_status, canope_certified
    _policy("tutor_profiles", "tutor_profiles_update", "UPDATE",
            using="profile_id = auth.uid() OR is_admin() OR is_canope_or_cosp()",
            check="profile_id = auth.uid() OR is_admin() OR is_canope_or_cosp()")

    # ── canope_profiles ───────────────────────────────────────────────────
    _enable_rls("canope_profiles")

    _policy("canope_profiles", "canope_profiles_select", "SELECT",
            using="profile_id = auth.uid() OR is_admin()")

    _policy("canope_profiles", "canope_profiles_insert", "INSERT",
            check="profile_id = auth.uid()")

    _policy("canope_profiles", "canope_profiles_update", "UPDATE",
            using="profile_id = auth.uid() OR is_admin()",
            check="profile_id = auth.uid() OR is_admin()")

    # ── parent_student_links ──────────────────────────────────────────────
    _enable_rls("parent_student_links")

    # Parent ou élève concerné peuvent voir le lien ; admin aussi
    _policy("parent_student_links", "psl_select", "SELECT",
            using="parent_id = auth.uid() OR student_id = auth.uid() OR is_admin()")

    # Seul le parent peut initier la liaison
    _policy("parent_student_links", "psl_insert", "INSERT",
            check="parent_id = auth.uid()")

    # Seul l'admin peut modifier (ex: marquer verified=true après vérification email)
    _policy("parent_student_links", "psl_update", "UPDATE",
            using="is_admin()", check="is_admin()")

    _policy("parent_student_links", "psl_delete", "DELETE",
            using="parent_id = auth.uid() OR is_admin()")

    # ── external_young_profiles ───────────────────────────────────────────
    _enable_rls("external_young_profiles")

    # Seul le créateur (acteur CANOPE/COSP) et admin voient le profil
    _policy("external_young_profiles", "eyp_select", "SELECT", using="""
      created_by IN (
        SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
      )
      OR is_admin()
    """)

    _policy("external_young_profiles", "eyp_insert", "INSERT",
            check="is_canope_or_cosp()")

    _policy("external_young_profiles", "eyp_update", "UPDATE", using="""
      created_by IN (
        SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
      )
      OR is_admin()
    """, check="""
      created_by IN (
        SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
      )
      OR is_admin()
    """)

    _policy("external_young_profiles", "eyp_delete", "DELETE",
            using="is_admin()")

    # ── sessions ──────────────────────────────────────────────────────────
    _enable_rls("sessions")

    # Session visible par : élève, tuteur, parent lié vérifié, admin
    _policy("sessions", "sessions_select", "SELECT", using="""
      student_id = auth.uid()
      OR tutor_id = auth.uid()
      OR is_verified_parent_of(student_id)
      OR is_admin()
    """)

    # Élève (majeur) ou parent (pour mineur) peuvent créer la réservation
    _policy("sessions", "sessions_insert", "INSERT", check="""
      student_id = auth.uid()
      OR is_verified_parent_of(student_id)
    """)

    # Tuteur : accepter/refuser/terminer sa session
    # Parent : approuver (parent_approved_at)
    # Admin : tout
    _policy("sessions", "sessions_update", "UPDATE", using="""
      tutor_id = auth.uid()
      OR is_verified_parent_of(student_id)
      OR student_id = auth.uid()
      OR is_admin()
    """, check="""
      tutor_id = auth.uid()
      OR is_verified_parent_of(student_id)
      OR student_id = auth.uid()
      OR is_admin()
    """)

    # Pas de suppression physique des sessions (audit trail)

    # ── availabilities ────────────────────────────────────────────────────
    _enable_rls("availabilities")

    # Créneaux validés visibles par tous (matching public)
    _policy("availabilities", "availabilities_select", "SELECT",
            using="true")

    # Seul le tuteur propriétaire gère ses créneaux
    _policy("availabilities", "availabilities_insert", "INSERT", check="""
      tutor_id IN (
        SELECT id FROM tutor_profiles WHERE profile_id = auth.uid()
      )
    """)

    _policy("availabilities", "availabilities_update", "UPDATE", using="""
      tutor_id IN (
        SELECT id FROM tutor_profiles WHERE profile_id = auth.uid()
      )
    """, check="""
      tutor_id IN (
        SELECT id FROM tutor_profiles WHERE profile_id = auth.uid()
      )
    """)

    _policy("availabilities", "availabilities_delete", "DELETE", using="""
      tutor_id IN (
        SELECT id FROM tutor_profiles WHERE profile_id = auth.uid()
      )
    """)

    # ── payments ──────────────────────────────────────────────────────────
    _enable_rls("payments")

    # Visible par : payeur, tuteur bénéficiaire (via session), admin
    _policy("payments", "payments_select", "SELECT", using="""
      payer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM sessions s
        WHERE s.id = payments.session_id AND s.tutor_id = auth.uid()
      )
      OR is_admin()
    """)

    # Seul le payeur initie le paiement
    _policy("payments", "payments_insert", "INSERT",
            check="payer_id = auth.uid()")

    # Mise à jour du statut : admin uniquement (webhooks passent par l'API FastAPI)
    _policy("payments", "payments_update", "UPDATE",
            using="is_admin()", check="is_admin()")

    # ── escrow_transactions ───────────────────────────────────────────────
    _enable_rls("escrow_transactions")

    # Visible par le tuteur bénéficiaire et l'admin
    _policy("escrow_transactions", "escrow_select", "SELECT",
            using="tutor_id = auth.uid() OR is_admin()")

    # Création et modification réservées au système (FastAPI service account)
    # En pratique : utiliser le service_role key Supabase côté FastAPI
    _policy("escrow_transactions", "escrow_insert", "INSERT",
            check="is_admin()")

    _policy("escrow_transactions", "escrow_update", "UPDATE",
            using="is_admin()", check="is_admin()")

    # ── assessments ───────────────────────────────────────────────────────
    _enable_rls("assessments")

    # Visible par : acteur CANOPE/COSP créateur, élève concerné, admin
    _policy("assessments", "assessments_select", "SELECT", using="""
      administered_by IN (
        SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
      )
      OR student_profile_id IN (
        SELECT id FROM student_profiles WHERE profile_id = auth.uid()
      )
      OR is_admin()
    """)

    # Seul un acteur CANOPE/COSP peut créer un bilan
    _policy("assessments", "assessments_insert", "INSERT",
            check="is_canope_or_cosp()")

    # Modification autorisée uniquement si status != 'validated'
    # (sauf admin qui peut tout modifier)
    _policy("assessments", "assessments_update", "UPDATE", using="""
      (
        administered_by IN (
          SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
        )
        AND status != 'validated'
      )
      OR is_admin()
    """, check="""
      (
        administered_by IN (
          SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
        )
        AND status != 'validated'
      )
      OR is_admin()
    """)

    _policy("assessments", "assessments_delete", "DELETE",
            using="is_admin()")

    # ── resources ─────────────────────────────────────────────────────────
    _enable_rls("resources")

    # Ressources publiées = visibles par tous
    # Non publiées = publisher + admin/canope
    _policy("resources", "resources_select", "SELECT", using="""
      is_published = true
      OR publisher_id = auth.uid()
      OR is_admin()
      OR is_canope_or_cosp()
    """)

    _policy("resources", "resources_insert", "INSERT",
            check="is_canope_or_cosp() AND publisher_id = auth.uid()")

    _policy("resources", "resources_update", "UPDATE",
            using="publisher_id = auth.uid() OR is_admin()",
            check="publisher_id = auth.uid() OR is_admin()")

    _policy("resources", "resources_delete", "DELETE",
            using="publisher_id = auth.uid() OR is_admin()")

    # ── reviews ───────────────────────────────────────────────────────────
    _enable_rls("reviews")

    # Avis public = visible par tous
    # Avis non public = reviewer, reviewee et admin uniquement
    _policy("reviews", "reviews_select", "SELECT", using="""
      is_public = true
      OR reviewer_id = auth.uid()
      OR reviewee_id = auth.uid()
      OR is_admin()
    """)

    # Seul un participant à la session peut laisser un avis
    _policy("reviews", "reviews_insert", "INSERT", check="""
      EXISTS (
        SELECT 1 FROM sessions s
        WHERE s.id = reviews.session_id
          AND (s.student_id = auth.uid() OR s.tutor_id = auth.uid())
          AND s.status = 'completed'
      )
    """)

    # Seul l'admin modère (is_public : true/false)
    _policy("reviews", "reviews_update", "UPDATE",
            using="is_admin()", check="is_admin()")

    # ── conversations ─────────────────────────────────────────────────────
    _enable_rls("conversations")

    # Visible uniquement par les participants de la conversation
    _policy("conversations", "conversations_select", "SELECT", using="""
      id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
      OR is_admin()
    """)

    # Seuls les participants peuvent mettre à jour (updated_at via trigger)
    _policy("conversations", "conversations_update", "UPDATE", using="""
      id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
    """, check="true")

    # ── conversation_participants ─────────────────────────────────────────
    _enable_rls("conversation_participants")

    # Un participant voit les membres des conversations dont il fait partie
    _policy("conversation_participants", "conv_participants_select", "SELECT",
            using="""
      conversation_id IN (
        SELECT conversation_id FROM conversation_participants cp
        WHERE cp.user_id = auth.uid()
      )
      OR is_admin()
    """)

    # Seul l'admin ou le système (service_role) peut ajouter des participants
    _policy("conversation_participants", "conv_participants_insert", "INSERT",
            check="is_admin()")

    _policy("conversation_participants", "conv_participants_delete", "DELETE",
            using="user_id = auth.uid() OR is_admin()")

    # ── messages ──────────────────────────────────────────────────────────
    _enable_rls("messages")

    # Visible uniquement par les participants de la conversation
    _policy("messages", "messages_select", "SELECT", using="""
      conversation_id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
      OR is_admin()
    """)

    # Seul un participant peut envoyer un message
    _policy("messages", "messages_insert", "INSERT", check="""
      sender_id = auth.uid()
      AND conversation_id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
    """)

    # Soft delete : seul l'auteur ou l'admin peut marquer is_deleted=true
    _policy("messages", "messages_update", "UPDATE",
            using="sender_id = auth.uid() OR is_admin()",
            check="sender_id = auth.uid() OR is_admin()")

    # ── message_reads ─────────────────────────────────────────────────────
    _enable_rls("message_reads")

    _policy("message_reads", "msg_reads_select", "SELECT",
            using="user_id = auth.uid() OR is_admin()")

    # Un participant marque ses propres messages comme lus
    _policy("message_reads", "msg_reads_insert", "INSERT",
            check="""
      user_id = auth.uid()
      AND message_id IN (
        SELECT m.id FROM messages m
        JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
        WHERE cp.user_id = auth.uid()
      )
    """)

    # ── message_reactions ─────────────────────────────────────────────────
    _enable_rls("message_reactions")

    # Participants voient les réactions de leur conversation
    _policy("message_reactions", "reactions_select", "SELECT", using="""
      message_id IN (
        SELECT m.id FROM messages m
        JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
        WHERE cp.user_id = auth.uid()
      )
    """)

    _policy("message_reactions", "reactions_insert", "INSERT", check="""
      user_id = auth.uid()
      AND message_id IN (
        SELECT m.id FROM messages m
        JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
        WHERE cp.user_id = auth.uid()
      )
    """)

    # Seul l'auteur retire sa réaction
    _policy("message_reactions", "reactions_delete", "DELETE",
            using="user_id = auth.uid()")

    # ── notifications ─────────────────────────────────────────────────────
    _enable_rls("notifications")

    # Notification strictement privée — visible uniquement par le destinataire
    _policy("notifications", "notifications_select", "SELECT",
            using="user_id = auth.uid()")

    # Marquer comme lue (is_read=true) par le destinataire uniquement
    _policy("notifications", "notifications_update", "UPDATE",
            using="user_id = auth.uid()",
            check="user_id = auth.uid()")

    # INSERT réservé au système via service_role (FastAPI / Edge Functions)
    _policy("notifications", "notifications_insert", "INSERT",
            check="is_admin()")


# ---------------------------------------------------------------------------
# downgrade() — désactive RLS et supprime toutes les policies
# ---------------------------------------------------------------------------

def downgrade() -> None:
    tables = [
        "profiles", "student_profiles", "tutor_profiles", "canope_profiles",
        "parent_student_links", "external_young_profiles",
        "sessions", "availabilities",
        "payments", "escrow_transactions",
        "assessments", "resources", "reviews",
        "conversations", "conversation_participants",
        "messages", "message_reads", "message_reactions",
        "notifications",
    ]

    policy_map = {
        "profiles":                  ["profiles_select", "profiles_update"],
        "student_profiles":          ["student_profiles_select", "student_profiles_insert",
                                      "student_profiles_update"],
        "tutor_profiles":            ["tutor_profiles_select", "tutor_profiles_insert",
                                      "tutor_profiles_update"],
        "canope_profiles":           ["canope_profiles_select", "canope_profiles_insert",
                                      "canope_profiles_update"],
        "parent_student_links":      ["psl_select", "psl_insert", "psl_update",
                                      "psl_delete"],
        "external_young_profiles":   ["eyp_select", "eyp_insert", "eyp_update",
                                      "eyp_delete"],
        "sessions":                  ["sessions_select", "sessions_insert",
                                      "sessions_update"],
        "availabilities":            ["availabilities_select", "availabilities_insert",
                                      "availabilities_update", "availabilities_delete"],
        "payments":                  ["payments_select", "payments_insert",
                                      "payments_update"],
        "escrow_transactions":       ["escrow_select", "escrow_insert", "escrow_update"],
        "assessments":               ["assessments_select", "assessments_insert",
                                      "assessments_update", "assessments_delete"],
        "resources":                 ["resources_select", "resources_insert",
                                      "resources_update", "resources_delete"],
        "reviews":                   ["reviews_select", "reviews_insert",
                                      "reviews_update"],
        "conversations":             ["conversations_select", "conversations_update"],
        "conversation_participants": ["conv_participants_select",
                                      "conv_participants_insert",
                                      "conv_participants_delete"],
        "messages":                  ["messages_select", "messages_insert",
                                      "messages_update"],
        "message_reads":             ["msg_reads_select", "msg_reads_insert"],
        "message_reactions":         ["reactions_select", "reactions_insert",
                                      "reactions_delete"],
        "notifications":             ["notifications_select", "notifications_update",
                                      "notifications_insert"],
    }

    for table, policies in policy_map.items():
        for policy in policies:
            _drop_policy(table, policy)
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")

    op.execute(_DROP_HELPER_FUNCTIONS)
