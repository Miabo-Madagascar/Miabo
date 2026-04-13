"""
Modèles SQLAlchemy — acteurs CANOPE/COSP et jeunes externes.
Tables : canope_profiles, external_young_profiles
"""

import uuid
from sqlalchemy import (Boolean, CheckConstraint, Column, Text, ForeignKey)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func
from sqlalchemy.types import Date, TIMESTAMP

from src.config.database import Base


class CanopProfile(Base):
    """
    Données spécifiques aux acteurs CANOPE et COSP.
    Identifiés par code SESAME (format CANOPE-XXXX ou COSP-XXXX).
    Un acteur avec is_cosp=True hérite des droits COSP en plus de CANOPE.
    """
    __tablename__ = "canope_profiles"

    id                  = Column(UUID(as_uuid=True), primary_key=True,
                                 default=uuid.uuid4)
    profile_id          = Column(UUID(as_uuid=True),
                                 ForeignKey("profiles.id", ondelete="CASCADE"),
                                 nullable=False, unique=True)
    sesame_code         = Column(Text, nullable=False, unique=True)
    first_name          = Column(Text, nullable=False)
    last_name           = Column(Text, nullable=False)
    date_of_birth       = Column(Date, nullable=False)
    gender              = Column(Text, nullable=False)
    city                = Column(Text, nullable=False)
    region              = Column(Text, nullable=False)
    phone               = Column(Text, nullable=False)
    profession          = Column(Text, nullable=False)
    education_level     = Column(Text)
    cosp_training_dates = Column(ARRAY(Date), nullable=False, server_default="{}")
    is_cosp             = Column(Boolean, nullable=False, server_default="false")
    created_at          = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("gender IN ('M', 'F', 'autre')", name="chk_canope_gender"),
    )


class ExternalYoungProfile(Base):
    """
    Jeunes non inscrits sur MIABO — créés par acteurs CANOPE/COSP
    pour la passation des tests d'orientation (Option B du CDC §COSP).
    """
    __tablename__ = "external_young_profiles"

    id              = Column(UUID(as_uuid=True), primary_key=True,
                             default=uuid.uuid4)
    created_by      = Column(UUID(as_uuid=True),
                             ForeignKey("canope_profiles.id", ondelete="RESTRICT"),
                             nullable=False)
    full_name       = Column(Text, nullable=False)
    date_of_birth   = Column(Date, nullable=False)
    gender          = Column(Text, nullable=False)
    region          = Column(Text, nullable=False)
    quartier        = Column(Text)
    serie           = Column(Text)
    school_name     = Column(Text)
    career_interest = Column(Text)
    created_at      = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("gender IN ('M', 'F', 'autre')",
                        name="chk_external_gender"),
        CheckConstraint("serie IN ('A1', 'A2', 'S', 'OSE', 'C', 'D', 'L')",
                        name="chk_external_serie"),
    )
