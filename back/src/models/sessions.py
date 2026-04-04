"""
Modèles SQLAlchemy — domaine Sessions & Réservations.
Tables : sessions, availabilities
"""

import uuid
from sqlalchemy import (Boolean, CheckConstraint, Column, Enum,
                         Integer, Text, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import Time, TIMESTAMP

from src.config.database import Base
from .enums import SessionStatus


class Session(Base):
    """
    Table centrale des réservations de tutorat.
    Cycle de statuts : pending_parent/tutor → confirmed → completed.
    Le montant est verrouillé à la réservation et ne peut plus être modifié.
    """
    __tablename__ = "sessions"

    id                 = Column(UUID(as_uuid=True), primary_key=True,
                                default=uuid.uuid4)
    student_id         = Column(UUID(as_uuid=True),
                                ForeignKey("profiles.id", ondelete="RESTRICT"),
                                nullable=False, index=True)
    tutor_id           = Column(UUID(as_uuid=True),
                                ForeignKey("profiles.id", ondelete="RESTRICT"),
                                nullable=False, index=True)
    status             = Column(Enum(SessionStatus, name="session_status"),
                                nullable=False, server_default="pending_tutor")
    subject            = Column(Text, nullable=False)
    mode               = Column(Text, nullable=False, server_default="online")
    scheduled_at       = Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    duration_minutes   = Column(Integer, nullable=False)
    amount_ariary      = Column(Integer, nullable=False)
    student_objectives = Column(Text)
    tutor_notes        = Column(Text)
    meeting_url        = Column(Text)
    cancelled_by       = Column(UUID(as_uuid=True),
                                ForeignKey("profiles.id", ondelete="SET NULL"))
    parent_approved_at = Column(TIMESTAMP(timezone=True))
    created_at         = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at         = Column(TIMESTAMP(timezone=True), server_default=func.now(),
                                onupdate=func.now())

    __table_args__ = (
        CheckConstraint("mode IN ('in_person', 'online')",
                        name="chk_session_mode"),
        CheckConstraint("duration_minutes IN (60, 90, 120, 180)",
                        name="chk_duration_minutes"),
        CheckConstraint("amount_ariary > 0",
                        name="chk_amount_positive"),
    )


class Availability(Base):
    """
    Créneaux de disponibilité tuteurs.
    Récurrents (day_of_week renseigné) ou ponctuels (specific_date renseigné).
    Les deux sont mutuellement exclusifs — enforced par contrainte CHECK.
    """
    __tablename__ = "availabilities"

    id            = Column(UUID(as_uuid=True), primary_key=True,
                           default=uuid.uuid4)
    tutor_id      = Column(UUID(as_uuid=True),
                           ForeignKey("tutor_profiles.id", ondelete="CASCADE"),
                           nullable=False, index=True)
    day_of_week   = Column(Integer)
    start_time    = Column(Time, nullable=False)
    end_time      = Column(Time, nullable=False)
    is_available  = Column(Boolean, nullable=False, server_default="true")
    specific_date = Column("specific_date", Text)  # type date côté PG

    __table_args__ = (
        CheckConstraint("day_of_week BETWEEN 0 AND 6",
                        name="chk_day_of_week"),
        CheckConstraint("end_time > start_time",
                        name="chk_end_after_start"),
        CheckConstraint(
            "(day_of_week IS NOT NULL AND specific_date IS NULL) OR "
            "(day_of_week IS NULL AND specific_date IS NOT NULL)",
            name="chk_recurring_or_specific"
        ),
    )
