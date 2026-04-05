"""
Router tuteurs — recherche, disponibilités, validation.
Préfixe : /api/v1/tutors
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/tutors", tags=["Tuteurs"])


@router.get("/search")
async def search_tutors(db: DbDep):
    """
    Recherche tuteurs avec filtres (matière, tarif, zone, RIASEC).
    Full-text search via PostgreSQL tsvector. TODO PHASE 2.
    """
    raise NotImplementedError


@router.get("/{tutor_id}")
async def get_tutor_profile(tutor_id: str, db: DbDep):
    """Profil public tuteur + disponibilités + avis. TODO PHASE 2."""
    raise NotImplementedError


@router.post("/{tutor_id}/compatibility")
async def get_compatibility_score(tutor_id: str, current_user: CurrentUser, db: DbDep):
    """Score compatibilité RIASEC élève/tuteur. TODO PHASE 2."""
    raise NotImplementedError


@router.put("/{tutor_id}/validate")
async def validate_tutor(tutor_id: str, current_user: CurrentUser, db: DbDep):
    """Valide ou rejette un tuteur (admin/canope). TODO PHASE 2."""
    raise NotImplementedError


@router.get("/{tutor_id}/availabilities")
async def get_availabilities(tutor_id: str, db: DbDep):
    """Créneaux disponibles du tuteur. TODO PHASE 2."""
    raise NotImplementedError
