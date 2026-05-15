"""
Router calendrier — CANOPE/COSP (CDC §7).
Endpoints : GET /calendar, POST /calendar, PUT /calendar/{id}, DELETE /calendar/{id}
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DbSession

from src.config.database import get_db
from src.dependencies import require_role
from src.models.users import Profile
from src.models.enums import UserRole
from src.schemas.calendar import CreateCalendarEventRequest, UpdateCalendarEventRequest
from src.services import calendar as svc

router = APIRouter(prefix="/calendar", tags=["Calendrier"])
_ROLES = (UserRole.canope, UserRole.cosp)


@router.get("/")
def list_events(
    upcoming: bool = False,
    db: DbSession = Depends(get_db),
    user: Profile = Depends(require_role(*_ROLES)),
):
    """Liste les événements — ?upcoming=true pour les événements à venir uniquement."""
    return svc.list_events(db, user, upcoming_only=upcoming)


@router.post("/", status_code=201)
def create_event(
    data: CreateCalendarEventRequest,
    db: DbSession = Depends(get_db),
    user: Profile = Depends(require_role(*_ROLES)),
):
    """Crée un nouvel événement dans le calendrier."""
    return svc.create_event(db, user, data)


@router.put("/{event_id}")
def update_event(
    event_id: str,
    data: UpdateCalendarEventRequest,
    db: DbSession = Depends(get_db),
    user: Profile = Depends(require_role(*_ROLES)),
):
    """Met à jour un événement existant."""
    return svc.update_event(db, user, event_id, data)


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    db: DbSession = Depends(get_db),
    user: Profile = Depends(require_role(*_ROLES)),
):
    """Supprime un événement."""
    svc.delete_event(db, user, event_id)
