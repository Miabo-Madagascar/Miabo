"""
Router sessions — réservation, confirmation, annulation.
Préfixe : /api/v1/sessions
"""

from fastapi import APIRouter, Query
from src.dependencies import DbDep, CurrentUser
from src.schemas.sessions import CreateSessionRequest, ConfirmSessionRequest
from src.models.enums import SessionStatus
from src.services import sessions as sessions_svc

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("/")
async def list_sessions(
    current_user: CurrentUser,
    db: DbDep,
    status: SessionStatus | None = Query(None, description="Filtre par statut"),
):
    """Liste les sessions de l'utilisateur connecté."""
    sessions = sessions_svc.list_sessions(db, current_user, status_filter=status)
    return [sessions_svc.session_to_dict(s, db) for s in sessions]


@router.post("/", status_code=201)
async def create_session(
    body: CreateSessionRequest,
    current_user: CurrentUser,
    db: DbDep,
):
    """Crée une demande de réservation (élève ou parent)."""
    session = sessions_svc.create_session(
        db,
        requester=current_user,
        tutor_id=body.tutor_id,
        subject=body.subject,
        scheduled_at=body.scheduled_at,
        duration_minutes=body.duration_minutes,
        mode=body.mode,
        objectives=body.notes,
    )
    return sessions_svc.session_to_dict(session, db)


@router.get("/{session_id}")
async def get_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Détail d'une session."""
    session = sessions_svc.get_session(db, session_id, current_user)
    return sessions_svc.session_to_dict(session, db)


@router.put("/{session_id}/confirm")
async def confirm_session(
    session_id: str,
    body: ConfirmSessionRequest,
    current_user: CurrentUser,
    db: DbDep,
):
    """Tuteur accepte ou refuse la session."""
    session = sessions_svc.get_session(db, session_id, current_user)
    updated = sessions_svc.confirm_session(
        db, session, current_user,
        accepted=body.accepted,
        reason=body.reason,
    )
    return sessions_svc.session_to_dict(updated, db)


@router.put("/{session_id}/approve")
async def approve_session(
    session_id: str,
    current_user: CurrentUser,
    db: DbDep,
    approved: bool = Query(..., description="True = valider, False = refuser"),
):
    """Parent valide ou refuse la demande de réservation."""
    session = sessions_svc.get_session(db, session_id, current_user)
    updated = sessions_svc.approve_parent(db, session, current_user, approved)
    return sessions_svc.session_to_dict(updated, db)


@router.put("/{session_id}/cancel")
async def cancel_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Annule une session."""
    session = sessions_svc.get_session(db, session_id, current_user)
    updated = sessions_svc.cancel_session(db, session, current_user)
    return sessions_svc.session_to_dict(updated, db)


@router.put("/{session_id}/complete")
async def complete_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Marque la session terminée. TODO Phase 4 : déclenche escrow."""
    raise NotImplementedError
