"""
Router auth — inscription et profil utilisateur.
Préfixe : /api/v1/auth

Flux Supabase + FastAPI :
  1. Frontend appelle Supabase Auth directement (signUp / signInWithPassword)
  2. Supabase retourne un JWT
  3. Frontend envoie ce JWT à POST /register pour créer la ligne `profiles`
  4. Tous les endpoints protégés valident ensuite le JWT via get_current_user()
"""

from fastapi import APIRouter, HTTPException, status
from jose import jwt as jose_jwt
import os

from src.dependencies import DbDep, CurrentUser
from src.schemas.auth import RegisterRequest, UpdateProfileRequest
from src.services.auth import create_profile, profile_to_dict
from src.models.enums import UserRole

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: DbDep):
    """
    Crée le profil BDD après inscription Supabase Auth.
    Appelé par le front juste après supabase.auth.signUp().
    Le JWT dans Authorization contient le sub (UUID Supabase).
    """
    # Décoder le JWT pour extraire l'UUID et l'email (sans re-valider via Depends
    # car le profil n'existe pas encore en BDD à ce stade)
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
    try:
        payload = jose_jwt.decode(
            body.token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        )

    user_id = payload.get("sub")
    email   = payload.get("email") or body.email

    if not user_id:
        raise HTTPException(status_code=400, detail="Token sans identifiant")

    profile = create_profile(
        db=db,
        user_id=user_id,
        email=email,
        full_name=body.full_name,
        role=UserRole(body.role.value),
        phone=body.phone,
        locale=body.locale,
    )
    return profile_to_dict(profile)


@router.get("/me")
async def get_me(current_user: CurrentUser):
    """
    Retourne le profil de l'utilisateur connecté.
    Utilise le JWT Supabase pour l'identifier.
    """
    return profile_to_dict(current_user)


@router.put("/me")
async def update_me(body: UpdateProfileRequest, current_user: CurrentUser, db: DbDep):
    """Met à jour les informations de base du profil connecté."""
    if body.full_name:
        current_user.full_name = body.full_name
    if body.phone is not None:
        current_user.phone = body.phone
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    if body.locale in ("fr", "mg"):
        current_user.preferred_language = body.locale

    db.commit()
    db.refresh(current_user)
    return profile_to_dict(current_user)
