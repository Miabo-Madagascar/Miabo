"""
Router tuteurs — recherche, profil public, disponibilités, validation.
Préfixe : /api/v1/tutors
"""

from fastapi import APIRouter, Query, HTTPException, status
from src.dependencies import DbDep, CurrentUser, require_role
from src.models.enums import UserRole
from src.schemas.sessions import AvailabilityRequest
from src.services import profiles as profiles_svc
from src.services import availabilities as avail_svc

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


# ── Endpoints authentifiés tuteur (/me) ────────────────────────────────────

@router.get("/me/availabilities")
async def list_my_availabilities(current_user: CurrentUser, db: DbDep):
    """Liste les créneaux du tuteur connecté."""
    return avail_svc.list_availabilities(db, current_user)


@router.post("/me/availabilities", status_code=201)
async def add_my_availability(
    body:         AvailabilityRequest,
    current_user: CurrentUser,
    db:           DbDep,
):
    """Ajoute un créneau (récurrent ou ponctuel) au tuteur connecté."""
    return avail_svc.add_availability(db, current_user, body)


@router.delete("/me/availabilities/{avail_id}", status_code=204)
async def delete_my_availability(
    avail_id:     str,
    current_user: CurrentUser,
    db:           DbDep,
):
    """Supprime un créneau du tuteur connecté."""
    avail_svc.delete_availability(db, current_user, avail_id)


# ── Endpoints publics tuteur ───────────────────────────────────────────────

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


from pydantic import BaseModel

class TutorValidationRequest(BaseModel):
    status: str  # "validated" or "rejected"

@router.put("/{tutor_id}/validate")
async def validate_tutor(
    tutor_id: str, 
    body: TutorValidationRequest,
    current_user: CurrentUser, 
    db: DbDep
):
    """Valide ou rejette un tuteur (admin/canope)."""
    if current_user.role not in (UserRole.admin, UserRole.canope):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs et CANOPE peuvent valider un tuteur."
        )
    
    from src.models.profiles import TutorProfile
    from src.models.enums import TutorStatus
    
    tp = db.query(TutorProfile).filter(TutorProfile.profile_id == tutor_id).first()
    if not tp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tuteur introuvable"
        )
        
    if body.status == "validated":
        tp.validation_status = TutorStatus.validated
    elif body.status == "rejected":
        tp.validation_status = TutorStatus.rejected
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statut invalide. Utilisez 'validated' ou 'rejected'."
        )
        
    db.commit()
    return {"message": f"Statut du tuteur mis à jour : {body.status}"}


@router.get("/{tutor_id}/availabilities")
async def get_tutor_availabilities(tutor_id: str, db: DbDep):
    """Créneaux publics d'un tuteur (identifié par son TutorProfile.id)."""
    return avail_svc.list_public_availabilities(db, tutor_id)
