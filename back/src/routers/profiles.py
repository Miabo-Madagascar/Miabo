"""
Router profils — consultation et mise à jour des profils utilisateurs.
Préfixe : /api/v1/profiles
"""

from fastapi import APIRouter, HTTPException, status
from src.dependencies import DbDep, CurrentUser
from src.schemas.auth import UpdateProfileRequest
from src.services import profiles as profiles_svc

router = APIRouter(prefix="/profiles", tags=["Profils"])


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
