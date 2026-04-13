"""
Schémas Pydantic — Calendrier CANOPE/COSP (CDC §7).
"""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, field_validator


class CreateCalendarEventRequest(BaseModel):
    """Création d'un événement dans le calendrier de l'acteur."""
    title:       str
    event_type:  Literal["assessment_session", "accompaniment"] = "assessment_session"
    start_at:    datetime
    end_at:      datetime | None = None
    location:    str | None = None
    description: str | None = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Le titre ne peut pas être vide")
        return v.strip()


class UpdateCalendarEventRequest(BaseModel):
    """Mise à jour partielle d'un événement."""
    title:       str | None = None
    event_type:  Literal["assessment_session", "accompaniment"] | None = None
    start_at:    datetime | None = None
    end_at:      datetime | None = None
    location:    str | None = None
    description: str | None = None
