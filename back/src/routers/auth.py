"""
Router auth — inscription, connexion, déconnexion.
Préfixe : /api/v1/auth
"""

from fastapi import APIRouter
from src.dependencies import DbDep

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=201)
async def register(db: DbDep):
    """Crée un compte Supabase Auth + profil en BDD. TODO PHASE 1."""
    raise NotImplementedError


@router.post("/login")
async def login(db: DbDep):
    """Connexion via Supabase Auth → retourne JWT. TODO PHASE 1."""
    raise NotImplementedError


@router.post("/logout")
async def logout():
    """Révoque la session Supabase. TODO PHASE 1."""
    raise NotImplementedError


@router.post("/refresh")
async def refresh_token():
    """Rafraîchit le JWT Supabase. TODO PHASE 1."""
    raise NotImplementedError
