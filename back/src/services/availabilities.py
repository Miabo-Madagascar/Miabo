"""
Service disponibilités tuteur — CRUD créneaux récurrents et ponctuels.
Logique : un créneau a soit day_of_week (récurrent) soit specific_date (ponctuel).
"""

import uuid
from sqlalchemy import asc, nulls_last
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.sessions import Availability
from src.models.profiles import TutorProfile
from src.models.users import Profile
from src.schemas.sessions import AvailabilityRequest


# ── Helpers internes ──────────────────────────────────────────────────────────

def _get_tutor_profile(db: DbSession, user: Profile) -> TutorProfile:
    """Récupère le TutorProfile du user connecté — lève 403 si absent."""
    tp = db.query(TutorProfile).filter(TutorProfile.profile_id == user.id).first()
    if not tp:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profil tuteur introuvable pour cet utilisateur",
        )
    return tp


def _to_dict(a: Availability) -> dict:
    """Sérialise un créneau en dict JSON-compatible."""
    return {
        "id":            str(a.id),
        "day_of_week":   a.day_of_week,
        "specific_date": a.specific_date,
        "start_time":    str(a.start_time),
        "end_time":      str(a.end_time),
        "is_available":  a.is_available,
    }


# ── Service ───────────────────────────────────────────────────────────────────

def list_availabilities(db: DbSession, user: Profile) -> list[dict]:
    """Créneaux du tuteur connecté, triés par jour puis heure de début."""
    tp   = _get_tutor_profile(db, user)
    rows = (
        db.query(Availability)
        .filter(Availability.tutor_id == tp.id)
        .order_by(Availability.day_of_week.asc().nulls_last(), Availability.start_time)
        .all()
    )
    return [_to_dict(a) for a in rows]


def list_public_availabilities(db: DbSession, tutor_profile_id: str) -> list[dict]:
    """Créneaux publics d'un tuteur identifié par son TutorProfile.id."""
    rows = (
        db.query(Availability)
        .filter(Availability.tutor_id == tutor_profile_id)
        .order_by(nulls_last(asc(Availability.day_of_week)), Availability.start_time)
        .all()
    )
    return [_to_dict(a) for a in rows]


def add_availability(db: DbSession, user: Profile, data: AvailabilityRequest) -> dict:
    """
    Ajoute un créneau récurrent (day_of_week) ou ponctuel (specific_date).
    Les deux champs sont mutuellement exclusifs.
    """
    recurring = data.day_of_week is not None
    punctual  = data.specific_date is not None

    if recurring == punctual:          # les deux True ou les deux False
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Renseignez day_of_week OU specific_date, pas les deux.",
        )

    tp    = _get_tutor_profile(db, user)
    avail = Availability(
        id            = uuid.uuid4(),
        tutor_id      = tp.id,
        day_of_week   = data.day_of_week,
        specific_date = data.specific_date,
        start_time    = data.start_time,
        end_time      = data.end_time,
        is_available  = True,
    )
    db.add(avail)
    db.commit()
    db.refresh(avail)
    return _to_dict(avail)


def delete_availability(db: DbSession, user: Profile, avail_id: str) -> None:
    """Supprime un créneau — vérifie que le tuteur en est le propriétaire."""
    tp    = _get_tutor_profile(db, user)
    avail = (
        db.query(Availability)
        .filter(Availability.id == avail_id, Availability.tutor_id == tp.id)
        .first()
    )
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Créneau introuvable ou non autorisé",
        )
    db.delete(avail)
    db.commit()
