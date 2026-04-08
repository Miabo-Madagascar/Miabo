"""
Schémas Pydantic — Sessions et disponibilités.
"""

from datetime import datetime
from pydantic import BaseModel, field_validator
from src.models.enums import SessionStatus

VALID_DURATIONS = {60, 90, 120, 180}


class CreateSessionRequest(BaseModel):
    tutor_id:         str
    subject:          str
    scheduled_at:     datetime
    duration_minutes: int
    mode:             str   # "online" | "in_person"
    location:         str | None = None
    notes:            str | None = None

    @field_validator("duration_minutes")
    @classmethod
    def valid_duration(cls, v: int) -> int:
        if v not in VALID_DURATIONS:
            raise ValueError(f"Durée invalide. Valeurs : {VALID_DURATIONS}")
        return v


class ConfirmSessionRequest(BaseModel):
    accepted: bool
    reason:   str | None = None   # motif si refus


class SessionResponse(BaseModel):
    id:               str
    student_id:       str
    tutor_id:         str
    subject:          str
    scheduled_at:     datetime
    duration_minutes: int
    status:           SessionStatus
    created_at:       datetime

    model_config = {"from_attributes": True}


class AvailabilityRequest(BaseModel):
    day_of_week:    int | None = None   # 0=lundi … 6=dimanche
    specific_date:  str | None = None
    start_time:     str                  # "HH:MM"
    end_time:       str
    is_recurring:   bool = False
