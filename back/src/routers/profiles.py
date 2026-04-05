"""
Router profils — consultation et mise à jour des profils utilisateurs.
Préfixe : /api/v1/profiles
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/profiles", tags=["Profils"])


@router.get("/me")
async def get_my_profile(current_user: CurrentUser, db: DbDep):
    """Retourne le profil complet de l'utilisateur connecté. TODO PHASE 1."""
    raise NotImplementedError


@router.put("/me")
async def update_my_profile(current_user: CurrentUser, db: DbDep):
    """Met à jour le profil de l'utilisateur connecté. TODO PHASE 1."""
    raise NotImplementedError


@router.put("/tutor")
async def update_tutor_profile(current_user: CurrentUser, db: DbDep):
    """Met à jour le profil tuteur (matières, tarif, zones). TODO PHASE 1."""
    raise NotImplementedError


@router.get("/{user_id}")
async def get_public_profile(user_id: str, db: DbDep):
    """Profil public d'un utilisateur (tuteur validé). TODO PHASE 2."""
    raise NotImplementedError
