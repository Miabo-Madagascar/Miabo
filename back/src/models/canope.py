"""
Modèles SQLAlchemy — domaine CANOPE / COSP / Évaluations.
Tables : assessments, resources, reviews
"""

import uuid
from sqlalchemy import (Boolean, CheckConstraint, Column, Enum,
                         Integer, Text, ForeignKey)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base
from .enums import AssessmentStatus, ResourceType


class Assessment(Base):
    """
    Tests VAK/RIASEC/DISC — administrés par un acteur CANOPE ou COSP.
    Contrainte XOR : lié soit à un élève MIABO (Option A),
    soit à un jeune externe (Option B) — jamais les deux.
    Un assessment validé est immuable (sauf correction Admin).
    """
    __tablename__ = "assessments"

    id                 = Column(UUID(as_uuid=True), primary_key=True,
                                default=uuid.uuid4)
    administered_by    = Column(UUID(as_uuid=True),
                                ForeignKey("canope_profiles.id", ondelete="RESTRICT"),
                                nullable=False, index=True)
    # Option A : élève inscrit sur MIABO
    student_profile_id = Column(UUID(as_uuid=True),
                                ForeignKey("student_profiles.id", ondelete="SET NULL"),
                                index=True)
    # Option B : jeune externe sans compte
    external_young_id  = Column(UUID(as_uuid=True),
                                ForeignKey("external_young_profiles.id",
                                           ondelete="SET NULL"),
                                index=True)
    serie              = Column(Text)
    career_interest    = Column(Text)
    # Scores VAK (max : V=10 / A=9 / K=11 — CDC §COSP)
    vak_v_score        = Column(Integer)
    vak_a_score        = Column(Integer)
    vak_k_score        = Column(Integer)
    vak_dominant       = Column(Text)
    # Scores RIASEC — ex: {"R":4,"I":7,"A":2,"S":9,"E":5,"C":3}
    riasec_scores      = Column(JSONB)
    riasec_code        = Column(Text)
    # Scores DISC — ex: {"D":12,"I":18,"S":9,"C":15}
    disc_scores        = Column(JSONB)
    disc_dominant      = Column(Text)
    actor_comment      = Column(Text)
    status             = Column(Enum(AssessmentStatus, name="assessment_status"),
                                nullable=False, server_default="draft")
    created_at         = Column(TIMESTAMP(timezone=True), server_default=func.now())
    validated_at       = Column(TIMESTAMP(timezone=True))

    __table_args__ = (
        # XOR : Option A ou Option B — pas les deux
        CheckConstraint(
            "(student_profile_id IS NOT NULL AND external_young_id IS NULL) OR "
            "(student_profile_id IS NULL AND external_young_id IS NOT NULL)",
            name="chk_subject_exclusive"
        ),
        CheckConstraint("vak_v_score BETWEEN 0 AND 50",  name="chk_vak_v"),
        CheckConstraint("vak_a_score BETWEEN 0 AND 50",  name="chk_vak_a"),
        CheckConstraint("vak_k_score BETWEEN 0 AND 50",  name="chk_vak_k"),
        CheckConstraint("vak_dominant IN ('V','A','K')",  name="chk_vak_dom"),
        CheckConstraint("char_length(riasec_code) = 3",  name="chk_riasec"),
        CheckConstraint("disc_dominant IN ('D','I','S','C')", name="chk_disc"),
        CheckConstraint("serie IN ('A1', 'A2', 'S', 'OSE', 'C', 'D', 'L')", name="chk_serie_assess"),
    )


class Resource(Base):
    """Ressources pédagogiques certifiées CANOPE — bilingues FR/MG."""
    __tablename__ = "resources"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    publisher_id = Column(UUID(as_uuid=True),
                          ForeignKey("profiles.id", ondelete="RESTRICT"),
                          nullable=False, index=True)
    title_fr     = Column(Text, nullable=False)
    title_mg     = Column(Text)
    type         = Column(Enum(ResourceType, name="resource_type"), nullable=False)
    subject      = Column(Text, nullable=False, index=True)
    grade_level  = Column(Text)
    file_url     = Column(Text)
    is_premium   = Column(Boolean, nullable=False, server_default="false")
    is_published = Column(Boolean, nullable=False, server_default="false")
    created_at   = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Review(Base):
    """Avis post-session — 1 par session, modéré avant publication."""
    __tablename__ = "reviews"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id  = Column(UUID(as_uuid=True),
                         ForeignKey("sessions.id", ondelete="CASCADE"),
                         nullable=False, unique=True)
    reviewer_id = Column(UUID(as_uuid=True),
                         ForeignKey("profiles.id", ondelete="CASCADE"),
                         nullable=False)
    reviewee_id = Column(UUID(as_uuid=True),
                         ForeignKey("profiles.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    rating      = Column(Integer, nullable=False)
    comment     = Column(Text)
    is_public   = Column(Boolean, nullable=False, server_default="false")
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5",            name="chk_rating_range"),
        CheckConstraint("reviewer_id <> reviewee_id",        name="chk_no_self_review"),
        CheckConstraint("char_length(comment) <= 500",       name="chk_comment_length"),
    )
