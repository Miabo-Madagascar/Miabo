"""
Modèle SQLAlchemy — Événements calendrier CANOPE/COSP (CDC §7).
Table : canope_calendar_events
"""

import uuid
from sqlalchemy import CheckConstraint, Column, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base


class CalendarEvent(Base):
    """
    Événement planifié par un acteur CANOPE ou COSP.
    Deux types : séance d'accompagnement ou session de passation de tests.
    """
    __tablename__ = "canope_calendar_events"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by   = Column(
        UUID(as_uuid=True),
        ForeignKey("canope_profiles.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    title        = Column(Text, nullable=False)
    event_type   = Column(Text, nullable=False, server_default="assessment_session")
    start_at     = Column(TIMESTAMP(timezone=True), nullable=False)
    end_at       = Column(TIMESTAMP(timezone=True))
    location     = Column(Text)
    description  = Column(Text)
    created_at   = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('assessment_session', 'accompaniment')",
            name="chk_calendar_event_type",
        ),
    )
