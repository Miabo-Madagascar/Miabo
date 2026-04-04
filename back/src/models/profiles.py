"""
Modèles SQLAlchemy — profils métier élève et tuteur.
Tables : student_profiles, tutor_profiles
"""

import uuid
from sqlalchemy import (Boolean, CheckConstraint, Column, Enum,
                         Integer, Numeric, Text, ForeignKey, String)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base
from .enums import TutorStatus


class StudentProfile(Base):
    """
    Données métier de l'élève : niveau scolaire, profil VAK,
    codes RIASEC/DISC — synchronisés depuis assessments validés.
    """
    __tablename__ = "student_profiles"

    id              = Column(UUID(as_uuid=True), primary_key=True,
                             default=uuid.uuid4)
    profile_id      = Column(UUID(as_uuid=True),
                             ForeignKey("profiles.id", ondelete="CASCADE"),
                             nullable=False, unique=True)
    grade_level     = Column(Text, nullable=False)
    school_name     = Column(Text)
    serie           = Column(Text)
    date_of_birth   = Column("date_of_birth", Text)  # type date côté PG

    # Scores VAK — limites max selon le CDC (V:10 / A:9 / K:11)
    vak_visual      = Column(Integer)
    vak_auditory    = Column(Integer)
    vak_kinesthetic = Column(Integer)
    vak_dominant    = Column(String(1))

    # Codes synthétiques des tests d'orientation
    riasec_code     = Column(String(2))
    disc_profile    = Column(String(1))

    subjects_needed = Column(ARRAY(Text), nullable=False, server_default="{}")
    location        = Column(Text)

    __table_args__ = (
        CheckConstraint(
            "grade_level IN ('6eme','5eme','4eme','3eme','2nde','1ere','Tle','superieur')",
            name="chk_grade_level"
        ),
        CheckConstraint("serie IN ('L', 'S')",          name="chk_serie_student"),
        CheckConstraint("vak_visual BETWEEN 0 AND 10",  name="chk_vak_visual"),
        CheckConstraint("vak_auditory BETWEEN 0 AND 9", name="chk_vak_auditory"),
        CheckConstraint("vak_kinesthetic BETWEEN 0 AND 11", name="chk_vak_kinesthetic"),
        CheckConstraint("vak_dominant IN ('V', 'A', 'K')", name="chk_vak_dominant"),
        CheckConstraint("char_length(riasec_code) = 2",     name="chk_riasec_code"),
        CheckConstraint("disc_profile IN ('D','I','S','C')", name="chk_disc_profile"),
    )


class TutorProfile(Base):
    """
    Données métier du tuteur : tarifs, matières, certification CANOPE,
    wallet (escrow libéré − commission 10% MIABO).
    """
    __tablename__ = "tutor_profiles"

    id                = Column(UUID(as_uuid=True), primary_key=True,
                               default=uuid.uuid4)
    profile_id        = Column(UUID(as_uuid=True),
                               ForeignKey("profiles.id", ondelete="CASCADE"),
                               nullable=False, unique=True)
    validation_status = Column(Enum(TutorStatus, name="tutor_status"),
                               nullable=False, server_default="pending")
    bio               = Column(Text)
    subjects          = Column(ARRAY(Text), nullable=False, server_default="{}")
    grade_levels      = Column(ARRAY(Text), nullable=False, server_default="{}")
    hourly_rate       = Column(Integer, nullable=False)
    teaching_methods  = Column(ARRAY(Text), nullable=False, server_default="{}")
    location          = Column(Text)
    avg_rating        = Column(Numeric(3, 2), nullable=False, server_default="0.00")
    total_sessions    = Column(Integer, nullable=False, server_default="0")
    canope_certified  = Column(Boolean, nullable=False, server_default="false")
    kyc_verified      = Column(Boolean, nullable=False, server_default="false")
    wallet_balance    = Column(Integer, nullable=False, server_default="0")
    slug              = Column(Text, unique=True)
    updated_at        = Column(TIMESTAMP(timezone=True), server_default=func.now(),
                               onupdate=func.now())

    __table_args__ = (
        CheckConstraint("hourly_rate >= 2000",               name="chk_min_hourly_rate"),
        CheckConstraint("avg_rating BETWEEN 0 AND 5",        name="chk_avg_rating"),
        CheckConstraint("wallet_balance >= 0",               name="chk_wallet_positive"),
        CheckConstraint("char_length(bio) <= 1000",          name="chk_bio_length"),
    )
