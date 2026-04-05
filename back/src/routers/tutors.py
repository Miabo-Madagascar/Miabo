"""
Router tuteurs — recherche, profil public, disponibilités, validation.
Préfixe : /api/v1/tutors
"""

from fastapi import APIRouter, Query, HTTPException, status
from src.dependencies import DbDep, CurrentUser
from src.services import profiles as profiles_svc

router = APIRouter(prefix="/tutors", tags=["Tuteurs"])


@router.get("/search")
async def search_tutors(
    db:       DbDep,
    subject:  str | None = Query(None, description="Matière enseignée"),
    location: str | None = Query(None, description="Ville / quartier"),
    min_rate: int | None = Query(None, ge=2000, description="Tarif min (Ar/h)"),
    max_rate: int | None = Query(None, description="Tarif max (Ar/h)"),
    limit:    int        = Query(20, ge=1, le=50),
    offset:   int        = Query(0, ge=0),
):
    """
    Recherche tuteurs validés avec filtres.
    Triés par note moyenne puis nombre de sessions.
    """
    return profiles_svc.search_tutors(
        db,
        subject=subject,
        location=location,
        min_rate=min_rate,
        max_rate=max_rate,
        limit=limit,
        offset=offset,
    )


@router.get("/{tutor_id}")
async def get_tutor_profile(tutor_id: str, db: DbDep):
    """Profil public tuteur."""
    profile = profiles_svc.get_tutor_public_profile(db, tutor_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tuteur introuvable",
        )
    return profile


@router.post("/{tutor_id}/compatibility")
async def get_compatibility_score(
    tutor_id: str, current_user: CurrentUser, db: DbDep
):
    """Score compatibilité RIASEC élève/tuteur. TODO PHASE 2."""
    raise NotImplementedError


@router.put("/{tutor_id}/validate")
async def validate_tutor(
    tutor_id: str, current_user: CurrentUser, db: DbDep
):
    """Valide ou rejette un tuteur (admin/canope). TODO PHASE 2."""
    raise NotImplementedError


@router.get("/{tutor_id}/availabilities")
async def get_availabilities(tutor_id: str, db: DbDep):
    """Créneaux disponibles du tuteur. TODO PHASE 2."""
    raise NotImplementedError
