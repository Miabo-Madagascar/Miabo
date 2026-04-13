"""
Router profils — consultation et mise à jour des profils utilisateurs.
Préfixe : /api/v1/profiles
"""

from fastapi import APIRouter, HTTPException, status
from src.dependencies import DbDep, CurrentUser
from src.schemas.auth import UpdateProfileRequest, UpdateTutorProfileRequest, UpdateCanopProfileRequest
from src.services import profiles as profiles_svc

router = APIRouter(prefix="/profiles", tags=["Profils"])


@router.get("/students")
async def list_students(db: DbDep):
    """Liste tous les élèves (accessible par CANOPE/COSP)."""
    return profiles_svc.list_students(db)


@router.get("/me")
async def get_my_profile(current_user: CurrentUser, db: DbDep):
    """Retourne le profil complet de l'utilisateur connecté."""
    return profiles_svc.get_full_profile(db, current_user)


@router.put("/me")
async def update_my_profile(
    body:         UpdateProfileRequest,
    current_user: CurrentUser,
    db:           DbDep,
):
    """Met à jour les champs de base du profil connecté."""
    updated = profiles_svc.update_basic_profile(
        db,
        current_user,
        full_name=body.full_name,
        phone=body.phone,
        avatar_url=body.avatar_url,
        locale=body.locale,
    )
    return profiles_svc.get_full_profile(db, updated)


@router.put("/me/tutor")
async def update_my_tutor_profile(
    body:         UpdateTutorProfileRequest,
    current_user: CurrentUser,
    db:           DbDep,
):
    """Met à jour le sous-profil tuteur (bio, matières, tarif, etc.)."""
    return profiles_svc.update_tutor_profile(
        db,
        current_user,
        bio=body.bio,
        subjects=body.subjects,
        grade_levels=body.grade_levels,
        hourly_rate=body.hourly_rate,
        teaching_methods=body.teaching_methods,
        location=body.location,
    )


@router.put("/me/canope")
async def update_my_canop_profile(
    body:         UpdateCanopProfileRequest,
    current_user: CurrentUser,
    db:           DbDep,
):
    """Met à jour le sous-profil CANOPE/COSP (identité, adresse, profil, formation)."""
    return profiles_svc.update_canope_profile(db, current_user, body)


@router.get("/{user_id}")
async def get_public_profile(user_id: str, db: DbDep):
    """Profil public d'un tuteur validé."""
    profile = profiles_svc.get_tutor_public_profile(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil introuvable",
        )
    return profile
