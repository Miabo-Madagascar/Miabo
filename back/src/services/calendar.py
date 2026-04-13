"""
Service calendrier — CANOPE/COSP (CDC §7).
Gestion des événements planifiés : séances d'accompagnement + passations de tests.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.calendar import CalendarEvent
from src.models.canope_users import CanopProfile
from src.models.users import Profile
from src.schemas.calendar import CreateCalendarEventRequest, UpdateCalendarEventRequest


def _get_cp(db: DbSession, user: Profile) -> CanopProfile:
    cp = db.query(CanopProfile).filter(CanopProfile.profile_id == user.id).first()
    if not cp:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Profil CANOPE/COSP introuvable")
    return cp


def _to_dict(e: CalendarEvent) -> dict:
    return {
        "id":          str(e.id),
        "title":       e.title,
        "event_type":  e.event_type,
        "start_at":    e.start_at.isoformat(),
        "end_at":      e.end_at.isoformat() if e.end_at else None,
        "location":    e.location,
        "description": e.description,
        "created_at":  e.created_at.isoformat() if e.created_at else None,
    }


def list_events(
    db: DbSession, user: Profile, upcoming_only: bool = False
) -> list[dict]:
    """Liste les événements de l'acteur, du plus proche au plus lointain."""
    cp = _get_cp(db, user)
    q  = db.query(CalendarEvent).filter(CalendarEvent.created_by == cp.id)
    if upcoming_only:
        q = q.filter(CalendarEvent.start_at >= datetime.now(timezone.utc))
    return [_to_dict(e) for e in q.order_by(CalendarEvent.start_at.asc()).all()]


def create_event(
    db: DbSession, user: Profile, data: CreateCalendarEventRequest
) -> dict:
    """Crée un événement dans le calendrier de l'acteur."""
    cp = _get_cp(db, user)
    e  = CalendarEvent(
        id=uuid.uuid4(),
        created_by=cp.id,
        title=data.title,
        event_type=data.event_type,
        start_at=data.start_at,
        end_at=data.end_at,
        location=data.location,
        description=data.description,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return _to_dict(e)


def update_event(
    db: DbSession, user: Profile, event_id: str, data: UpdateCalendarEventRequest
) -> dict:
    """Met à jour un événement (acteur propriétaire uniquement)."""
    cp = _get_cp(db, user)
    e  = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.created_by == cp.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return _to_dict(e)


def delete_event(db: DbSession, user: Profile, event_id: str) -> None:
    """Supprime un événement (acteur propriétaire uniquement)."""
    cp = _get_cp(db, user)
    e  = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.created_by == cp.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    db.delete(e)
    db.commit()
