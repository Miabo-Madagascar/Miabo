"""
Router sessions — réservation, confirmation, complétion.
Préfixe : /api/v1/sessions
CDC endpoints : POST /, PUT /{id}/confirm, PUT /{id}/complete
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.get("/")
async def list_sessions(current_user: CurrentUser, db: DbDep):
    """Liste les sessions de l'utilisateur connecté. TODO PHASE 2."""
    raise NotImplementedError


@router.post("/", status_code=201)
async def create_session(current_user: CurrentUser, db: DbDep):
    """Crée une demande de réservation (élève/parent). TODO PHASE 2."""
    raise NotImplementedError


@router.get("/{session_id}")
async def get_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Détail d'une session. TODO PHASE 2."""
    raise NotImplementedError


@router.put("/{session_id}/confirm")
async def confirm_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Tuteur accepte ou refuse la session. TODO PHASE 2."""
    raise NotImplementedError


@router.put("/{session_id}/complete")
async def complete_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Marque la session terminée — déclenche libération escrow. TODO PHASE 4."""
    raise NotImplementedError


@router.put("/{session_id}/cancel")
async def cancel_session(session_id: str, current_user: CurrentUser, db: DbDep):
    """Annule une session. TODO PHASE 2."""
    raise NotImplementedError
