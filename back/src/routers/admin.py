"""
Router administration — KPIs, gestion utilisateurs, analytics.
Préfixe : /api/v1/admin
CDC endpoint : GET /api/v1/analytics/platform
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser, require_role
from src.models.enums import UserRole

router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
    dependencies=[],  # require_role branché en PHASE 3
)


@router.get("/analytics/platform")
async def get_platform_analytics(current_user: CurrentUser, db: DbDep):
    """KPIs plateforme : utilisateurs, sessions, revenus, escrow. TODO PHASE 3."""
    raise NotImplementedError


@router.get("/users")
async def list_users(current_user: CurrentUser, db: DbDep):
    """Liste tous les utilisateurs avec filtres. TODO PHASE 3."""
    raise NotImplementedError


@router.put("/users/{user_id}/suspend")
async def suspend_user(user_id: str, current_user: CurrentUser, db: DbDep):
    """Suspend un compte utilisateur. TODO PHASE 3."""
    raise NotImplementedError


@router.get("/tutors/pending")
async def list_pending_tutors(current_user: CurrentUser, db: DbDep):
    """Liste les tuteurs en attente de validation. TODO PHASE 2."""
    raise NotImplementedError


@router.get("/escrow")
async def list_escrow_transactions(current_user: CurrentUser, db: DbDep):
    """Vue d'ensemble des transactions escrow en cours. TODO PHASE 4."""
    raise NotImplementedError
