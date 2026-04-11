"""Schéma initial MIABO v2 — toutes les tables

Revision ID: 0001
Revises: None
Create Date: 2026-04-04 00:00:00
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ---------------------------------------------------------------------------
# Helpers : création des types ENUM PostgreSQL
# ---------------------------------------------------------------------------

def _safe_create_enum(name: str, values: str) -> None:
    """Crée un ENUM PostgreSQL de manière idempotente (ignore si déjà existant)."""
    op.execute(
        f"DO $$ BEGIN "
        f"CREATE TYPE {name} AS ENUM ({values}); "
        f"EXCEPTION WHEN duplicate_object THEN NULL; "
        f"END $$;"
    )


def _create_enums() -> None:
    """Crée tous les types ENUM avant les tables qui en dépendent."""
    _safe_create_enum("user_role",
                      "'student','tutor','parent','admin','canope','cosp'")
    _safe_create_enum("tutor_status",
                      "'pending','validated','rejected','suspended'")
    _safe_create_enum("session_status",
                      "'pending_parent','pending_tutor','confirmed',"
                      "'in_progress','completed','cancelled','disputed'")
    _safe_create_enum("payment_status",
                      "'pending','processing','completed','failed','refunded'")
    _safe_create_enum("escrow_status",
                      "'held','released','disputed','refunded'")
    _safe_create_enum("assessment_status",
                      "'draft','in_progress','validated'")
    _safe_create_enum("message_type",
                      "'text','image','file','system'")
    _safe_create_enum("notification_type",
                      "'session_request','payment','message','review','system'")
    _safe_create_enum("resource_type",
                      "'pdf','video','audio','quiz','exercise'")
    _safe_create_enum("conversation_type",
                      "'student_tutor','parent_tutor'")
    _safe_create_enum("payment_method",
                      "'mvola','orange_money','wallet'")


def _drop_enums() -> None:
    """Supprime les types ENUM lors du downgrade."""
    for t in [
        "user_role", "tutor_status", "session_status", "payment_status",
        "escrow_status", "assessment_status", "message_type",
        "notification_type", "resource_type", "conversation_type",
        "payment_method",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {t}")


# ---------------------------------------------------------------------------
# Trigger updated_at — appliqué sur plusieurs tables
# ---------------------------------------------------------------------------

_UPDATED_AT_TRIGGER_FN = """
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
"""


def _add_updated_at_trigger(table: str) -> None:
    op.execute(
        f"CREATE TRIGGER trg_{table}_updated_at "
        f"BEFORE UPDATE ON {table} "
        f"FOR EACH ROW EXECUTE FUNCTION update_updated_at()"
    )


# ---------------------------------------------------------------------------
# upgrade()
# ---------------------------------------------------------------------------

def upgrade() -> None:
    # ── Fonction trigger ───────────────────────────────────────────────────
    op.execute(_UPDATED_AT_TRIGGER_FN)

    # ── Types ENUM ─────────────────────────────────────────────────────────
    _create_enums()

    # ── TABLE : profiles ───────────────────────────────────────────────────
    op.create_table(
        "profiles",
        sa.Column("id",                 postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("role",               postgresql.ENUM(name="user_role", create_type=False), nullable=False),
        sa.Column("full_name",          sa.Text,  nullable=False),
        sa.Column("email",              sa.Text,  nullable=False, unique=True),
        sa.Column("phone",              sa.Text),
        sa.Column("avatar_url",         sa.Text),
        sa.Column("preferred_language", sa.String(2), nullable=False,
                  server_default="fr"),
        sa.Column("is_active",          sa.Boolean, nullable=False,
                  server_default=sa.text("true")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("preferred_language IN ('fr','mg')",
                           name="chk_preferred_language"),
        sa.CheckConstraint(r"phone ~ '^\+261[0-9]{9}$'",
                           name="chk_phone_format"),
    )
    _add_updated_at_trigger("profiles")

    # ── TABLE : student_profiles ───────────────────────────────────────────
    op.create_table(
        "student_profiles",
        sa.Column("id",              postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("profile_id",      postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  nullable=False, unique=True),
        sa.Column("grade_level",     sa.Text, nullable=False),
        sa.Column("school_name",     sa.Text),
        sa.Column("serie",           sa.Text),
        sa.Column("date_of_birth",   sa.Date),
        sa.Column("vak_visual",      sa.Integer),
        sa.Column("vak_auditory",    sa.Integer),
        sa.Column("vak_kinesthetic", sa.Integer),
        sa.Column("vak_dominant",    sa.String(1)),
        sa.Column("riasec_code",     sa.String(2)),
        sa.Column("disc_profile",    sa.String(1)),
        sa.Column("subjects_needed", postgresql.ARRAY(sa.Text), nullable=False,
                  server_default="{}"),
        sa.Column("location",        sa.Text),
        sa.CheckConstraint(
            "grade_level IN ('6eme','5eme','4eme','3eme','2nde','1ere','Tle','superieur')",
            name="chk_grade_level"),
        sa.CheckConstraint("serie IN ('L','S')",                name="chk_serie_student"),
        sa.CheckConstraint("vak_visual BETWEEN 0 AND 10",       name="chk_vak_visual"),
        sa.CheckConstraint("vak_auditory BETWEEN 0 AND 9",      name="chk_vak_auditory"),
        sa.CheckConstraint("vak_kinesthetic BETWEEN 0 AND 11",  name="chk_vak_kinesth"),
        sa.CheckConstraint("vak_dominant IN ('V','A','K')",     name="chk_vak_dominant"),
        sa.CheckConstraint("char_length(riasec_code) = 2",      name="chk_riasec_code"),
        sa.CheckConstraint("disc_profile IN ('D','I','S','C')", name="chk_disc_profile"),
    )

    # ── TABLE : tutor_profiles ─────────────────────────────────────────────
    op.create_table(
        "tutor_profiles",
        sa.Column("id",                postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("profile_id",        postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  nullable=False, unique=True),
        sa.Column("validation_status", postgresql.ENUM(name="tutor_status", create_type=False),
                  nullable=False, server_default="pending"),
        sa.Column("bio",               sa.Text),
        sa.Column("subjects",          postgresql.ARRAY(sa.Text), nullable=False,
                  server_default="{}"),
        sa.Column("grade_levels",      postgresql.ARRAY(sa.Text), nullable=False,
                  server_default="{}"),
        sa.Column("hourly_rate",       sa.Integer, nullable=False),
        sa.Column("teaching_methods",  postgresql.ARRAY(sa.Text), nullable=False,
                  server_default="{}"),
        sa.Column("location",          sa.Text),
        sa.Column("avg_rating",        sa.Numeric(3, 2), nullable=False,
                  server_default="0.00"),
        sa.Column("total_sessions",    sa.Integer, nullable=False, server_default="0"),
        sa.Column("canope_certified",  sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("kyc_verified",      sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("wallet_balance",    sa.Integer, nullable=False, server_default="0"),
        sa.Column("slug",              sa.Text, unique=True),
        sa.Column("updated_at",        sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("hourly_rate >= 2000",        name="chk_min_hourly_rate"),
        sa.CheckConstraint("avg_rating BETWEEN 0 AND 5", name="chk_avg_rating"),
        sa.CheckConstraint("wallet_balance >= 0",        name="chk_wallet_positive"),
        sa.CheckConstraint("char_length(bio) <= 1000",   name="chk_bio_length"),
    )
    _add_updated_at_trigger("tutor_profiles")

    # ── TABLE : canope_profiles ────────────────────────────────────────────
    op.create_table(
        "canope_profiles",
        sa.Column("id",                  postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("profile_id",          postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  nullable=False, unique=True),
        sa.Column("sesame_code",         sa.Text, nullable=False, unique=True),
        sa.Column("first_name",          sa.Text, nullable=False),
        sa.Column("last_name",           sa.Text, nullable=False),
        sa.Column("date_of_birth",       sa.Date, nullable=False),
        sa.Column("gender",              sa.Text, nullable=False),
        sa.Column("city",                sa.Text, nullable=False),
        sa.Column("region",              sa.Text, nullable=False),
        sa.Column("phone",               sa.Text, nullable=False),
        sa.Column("profession",          sa.Text, nullable=False),
        sa.Column("education_level",     sa.Text),
        sa.Column("cosp_training_dates", postgresql.ARRAY(sa.Date), nullable=False,
                  server_default="{}"),
        sa.Column("is_cosp",             sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("created_at",          sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("gender IN ('M','F','autre')", name="chk_canope_gender"),
    )

    # ── TABLE : parent_student_links ───────────────────────────────────────
    op.create_table(
        "parent_student_links",
        sa.Column("parent_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("student_id",   postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("relationship", sa.Text, nullable=False, server_default="parent"),
        sa.Column("verified",     sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("created_at",   sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint(
            "relationship IN ('parent','tuteur_legal','autre')",
            name="chk_relationship_type"),
    )

    # ── TABLE : external_young_profiles ───────────────────────────────────
    op.create_table(
        "external_young_profiles",
        sa.Column("id",              postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("created_by",      postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("canope_profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("full_name",       sa.Text, nullable=False),
        sa.Column("date_of_birth",   sa.Date, nullable=False),
        sa.Column("gender",          sa.Text, nullable=False),
        sa.Column("region",          sa.Text, nullable=False),
        sa.Column("quartier",        sa.Text),
        sa.Column("serie",           sa.Text),
        sa.Column("school_name",     sa.Text),
        sa.Column("career_interest", sa.Text),
        sa.Column("created_at",      sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("gender IN ('M','F','autre')", name="chk_external_gender"),
        sa.CheckConstraint("serie IN ('L','S')",          name="chk_external_serie"),
    )

    # ── TABLE : sessions ───────────────────────────────────────────────────
    op.create_table(
        "sessions",
        sa.Column("id",                 postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("student_id",         postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("tutor_id",           postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("status",             postgresql.ENUM(name="session_status", create_type=False),
                  nullable=False, server_default="pending_tutor"),
        sa.Column("subject",            sa.Text, nullable=False),
        sa.Column("mode",               sa.Text, nullable=False,
                  server_default="online"),
        sa.Column("scheduled_at",       sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("duration_minutes",   sa.Integer, nullable=False),
        sa.Column("amount_ariary",      sa.Integer, nullable=False),
        sa.Column("student_objectives", sa.Text),
        sa.Column("tutor_notes",        sa.Text),
        sa.Column("meeting_url",        sa.Text),
        sa.Column("cancelled_by",       postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="SET NULL")),
        sa.Column("parent_approved_at", sa.TIMESTAMP(timezone=True)),
        sa.Column("created_at",         sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.Column("updated_at",         sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("mode IN ('in_person','online')",    name="chk_session_mode"),
        sa.CheckConstraint("duration_minutes IN (60,90,120,180)",
                           name="chk_duration_minutes"),
        sa.CheckConstraint("amount_ariary > 0",                 name="chk_amount_pos"),
    )
    _add_updated_at_trigger("sessions")

    # ── TABLE : availabilities ─────────────────────────────────────────────
    op.create_table(
        "availabilities",
        sa.Column("id",            postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tutor_id",      postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("tutor_profiles.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("day_of_week",   sa.Integer),
        sa.Column("start_time",    sa.Time, nullable=False),
        sa.Column("end_time",      sa.Time, nullable=False),
        sa.Column("is_available",  sa.Boolean, nullable=False,
                  server_default=sa.text("true")),
        sa.Column("specific_date", sa.Date),
        sa.CheckConstraint("day_of_week BETWEEN 0 AND 6", name="chk_day_of_week"),
        sa.CheckConstraint("end_time > start_time",        name="chk_end_after_start"),
        sa.CheckConstraint(
            "(day_of_week IS NOT NULL AND specific_date IS NULL) OR "
            "(day_of_week IS NULL AND specific_date IS NOT NULL)",
            name="chk_recurring_or_specific"),
    )

    # ── TABLE : payments ───────────────────────────────────────────────────
    op.create_table(
        "payments",
        sa.Column("id",                postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("session_id",        postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("sessions.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("payer_id",          postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("amount_ariary",     sa.Integer, nullable=False),
        # Colonne générée : commission MIABO = 10%
        sa.Column("commission_ariary", sa.Integer,
                  sa.Computed("amount_ariary / 10", persisted=True)),
        sa.Column("payment_method",    postgresql.ENUM(name="payment_method", create_type=False),
                  nullable=False),
        sa.Column("status",            postgresql.ENUM(name="payment_status", create_type=False),
                  nullable=False, server_default="pending"),
        sa.Column("external_ref",      sa.Text),
        sa.Column("phone_number",      sa.Text, nullable=False),
        sa.Column("created_at",        sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.Column("completed_at",      sa.TIMESTAMP(timezone=True)),
        sa.UniqueConstraint("session_id", name="uq_payment_session"),
        sa.CheckConstraint("amount_ariary > 0", name="chk_payment_amount_pos"),
    )

    # ── TABLE : escrow_transactions ────────────────────────────────────────
    op.create_table(
        "escrow_transactions",
        sa.Column("id",            postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("payment_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("payments.id", ondelete="RESTRICT"),
                  nullable=False, unique=True),
        sa.Column("tutor_id",      postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("amount_ariary", sa.Integer, nullable=False),
        sa.Column("status",        postgresql.ENUM(name="escrow_status", create_type=False),
                  nullable=False, server_default="held"),
        sa.Column("release_at",    sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("released_at",   sa.TIMESTAMP(timezone=True)),
        sa.CheckConstraint("amount_ariary > 0", name="chk_escrow_amount_pos"),
    )

    # ── TABLE : assessments ────────────────────────────────────────────────
    op.create_table(
        "assessments",
        sa.Column("id",                 postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("administered_by",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("canope_profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("student_profile_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("student_profiles.id", ondelete="SET NULL")),
        sa.Column("external_young_id",  postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("external_young_profiles.id", ondelete="SET NULL")),
        sa.Column("serie",              sa.Text),
        sa.Column("career_interest",    sa.Text),
        sa.Column("vak_v_score",        sa.Integer),
        sa.Column("vak_a_score",        sa.Integer),
        sa.Column("vak_k_score",        sa.Integer),
        sa.Column("vak_dominant",       sa.Text),
        sa.Column("riasec_scores",      postgresql.JSONB),
        sa.Column("riasec_code",        sa.Text),
        sa.Column("disc_scores",        postgresql.JSONB),
        sa.Column("disc_dominant",      sa.Text),
        sa.Column("actor_comment",      sa.Text),
        sa.Column("status",             postgresql.ENUM(name="assessment_status", create_type=False),
                  nullable=False, server_default="draft"),
        sa.Column("created_at",         sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.Column("validated_at",       sa.TIMESTAMP(timezone=True)),
        # XOR : Option A ou Option B — jamais les deux
        sa.CheckConstraint(
            "(student_profile_id IS NOT NULL AND external_young_id IS NULL) OR "
            "(student_profile_id IS NULL AND external_young_id IS NOT NULL)",
            name="chk_subject_exclusive"),
        sa.CheckConstraint("vak_v_score BETWEEN 0 AND 10",   name="chk_vak_v"),
        sa.CheckConstraint("vak_a_score BETWEEN 0 AND 9",    name="chk_vak_a"),
        sa.CheckConstraint("vak_k_score BETWEEN 0 AND 11",   name="chk_vak_k"),
        sa.CheckConstraint("vak_dominant IN ('V','A','K')",   name="chk_vak_dom"),
        sa.CheckConstraint("char_length(riasec_code) = 2",   name="chk_riasec"),
        sa.CheckConstraint("disc_dominant IN ('D','I','S','C')", name="chk_disc"),
        sa.CheckConstraint("serie IN ('L','S')",              name="chk_serie_assess"),
    )

    # ── TABLE : resources ─────────────────────────────────────────────────
    op.create_table(
        "resources",
        sa.Column("id",           postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("publisher_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="RESTRICT"),
                  nullable=False),
        sa.Column("title_fr",     sa.Text, nullable=False),
        sa.Column("title_mg",     sa.Text),
        sa.Column("type",         postgresql.ENUM(name="resource_type", create_type=False), nullable=False),
        sa.Column("subject",      sa.Text, nullable=False),
        sa.Column("grade_level",  sa.Text),
        sa.Column("file_url",     sa.Text),
        sa.Column("is_premium",   sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("is_published", sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("created_at",   sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
    )

    # ── TABLE : reviews ────────────────────────────────────────────────────
    op.create_table(
        "reviews",
        sa.Column("id",          postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("session_id",  postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("sessions.id", ondelete="CASCADE"),
                  nullable=False, unique=True),
        sa.Column("reviewer_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("reviewee_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("rating",      sa.Integer, nullable=False),
        sa.Column("comment",     sa.Text),
        sa.Column("is_public",   sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("created_at",  sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("rating BETWEEN 1 AND 5",       name="chk_rating_range"),
        sa.CheckConstraint("reviewer_id <> reviewee_id",   name="chk_no_self_review"),
        sa.CheckConstraint("char_length(comment) <= 500",  name="chk_comment_length"),
    )

    # ── TABLE : conversations ──────────────────────────────────────────────
    op.create_table(
        "conversations",
        sa.Column("id",         postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("type",       postgresql.ENUM(name="conversation_type", create_type=False),
                  nullable=False, server_default="student_tutor"),
        sa.Column("session_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("sessions.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
    )
    _add_updated_at_trigger("conversations")

    # ── TABLE : conversation_participants ──────────────────────────────────
    op.create_table(
        "conversation_participants",
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("conversations.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("user_id",         postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("joined_at",       sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
    )

    # ── TABLE : messages ───────────────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column("id",              postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("conversations.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("sender_id",       postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content",         sa.Text, nullable=False),
        sa.Column("message_type",    postgresql.ENUM(name="message_type", create_type=False),
                  nullable=False, server_default="text"),
        sa.Column("file_url",        sa.Text),
        sa.Column("is_deleted",      sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("created_at",      sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("char_length(content) > 0", name="chk_content_not_empty"),
    )

    # ── TABLE : message_reads ──────────────────────────────────────────────
    op.create_table(
        "message_reads",
        sa.Column("message_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("messages.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("user_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("read_at",    sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
    )

    # ── TABLE : message_reactions ──────────────────────────────────────────
    op.create_table(
        "message_reactions",
        sa.Column("message_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("messages.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("user_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("emoji",      sa.Text, primary_key=True, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint(
            "emoji IN ('👍','❤️','😊','✅','😮','😢')",
            name="chk_allowed_emojis"),
    )

    # ── TABLE : notifications ──────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id",         postgresql.UUID(as_uuid=True),
                  primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("profiles.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("type",       postgresql.ENUM(name="notification_type", create_type=False), nullable=False),
        sa.Column("title",      sa.Text, nullable=False),
        sa.Column("body",       sa.Text),
        sa.Column("link",       sa.Text),
        sa.Column("is_read",    sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True),
                  server_default=sa.text("now()")),
        sa.CheckConstraint("char_length(title) <= 100", name="chk_notif_title_length"),
    )

    # ── Index de performance ───────────────────────────────────────────────
    op.create_index("idx_profiles_role",          "profiles",  ["role"])
    op.create_index("idx_profiles_is_active",     "profiles",  ["is_active"])
    op.create_index("idx_student_profile_id",     "student_profiles", ["profile_id"])
    op.create_index("idx_student_grade_level",    "student_profiles", ["grade_level"])
    op.create_index("idx_student_location",       "student_profiles", ["location"])
    op.create_index("idx_tutor_profile_id",       "tutor_profiles",   ["profile_id"])
    op.create_index("idx_tutor_validation",       "tutor_profiles",   ["validation_status"])
    op.create_index("idx_tutor_location",         "tutor_profiles",   ["location"])
    op.create_index("idx_tutor_slug",             "tutor_profiles",   ["slug"])
    op.create_index("idx_sessions_student_id",    "sessions",  ["student_id"])
    op.create_index("idx_sessions_tutor_id",      "sessions",  ["tutor_id"])
    op.create_index("idx_sessions_status",        "sessions",  ["status"])
    op.create_index("idx_sessions_scheduled_at",  "sessions",  ["scheduled_at"])
    op.create_index("idx_availabilities_tutor",   "availabilities", ["tutor_id"])
    op.create_index("idx_payments_session_id",    "payments",  ["session_id"])
    op.create_index("idx_payments_payer_id",      "payments",  ["payer_id"])
    op.create_index("idx_escrow_tutor_id",        "escrow_transactions", ["tutor_id"])
    op.create_index("idx_assessments_admin_by",   "assessments", ["administered_by"])
    op.create_index("idx_resources_subject",      "resources", ["subject"])
    op.create_index("idx_reviews_reviewee_id",    "reviews",   ["reviewee_id"])
    op.create_index("idx_messages_conv_at",       "messages",
                    ["conversation_id", "created_at"])
    op.create_index("idx_notifications_user",     "notifications", ["user_id"])
    op.create_index("idx_conv_participants_user", "conversation_participants",
                    ["user_id"])


# ---------------------------------------------------------------------------
# downgrade() — annule dans l'ordre inverse des dépendances
# ---------------------------------------------------------------------------

def downgrade() -> None:
    # Tables dans l'ordre inverse des FK
    for table in [
        "notifications", "message_reactions", "message_reads", "messages",
        "conversation_participants", "conversations", "reviews", "resources",
        "assessments", "escrow_transactions", "payments", "availabilities",
        "sessions", "external_young_profiles", "parent_student_links",
        "canope_profiles", "tutor_profiles", "student_profiles", "profiles",
    ]:
        op.drop_table(table)

    # Suppression des types ENUM
    _drop_enums()

    # Suppression de la fonction trigger
    op.execute("DROP FUNCTION IF EXISTS update_updated_at()")
