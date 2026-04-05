"""
Dépendances FastAPI partagées — injectées via Depends().
Centralise : session BDD, utilisateur courant, contrôle de rôle.
"""

import os
from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from src.config.database import SessionLocal
from src.models.users import Profile
from src.models.enums import UserRole

# ── Session BDD ────────────────────────────────────────────────────────────

def get_db() -> Generator[Session, None, None]:
    """Fournit une session SQLAlchemy par requête."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DbDep = Annotated[Session, Depends(get_db)]

# ── Auth JWT Supabase ──────────────────────────────────────────────────────

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: DbDep,
) -> Profile:
    """
    Valide le JWT Supabase (HS256) et retourne le profil BDD.
    Le JWT secret se trouve dans Supabase > Settings > API > JWT Settings.
    """
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
    token      = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},   # Supabase n'utilise pas "aud"
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sans identifiant utilisateur",
        )

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Profil introuvable — inscription incomplète",
        )

    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte suspendu",
        )

    return profile

CurrentUser = Annotated[Profile, Depends(get_current_user)]

# ── Contrôle de rôle ───────────────────────────────────────────────────────

def require_role(*roles: UserRole):
    """
    Dependency factory — vérifie que l'utilisateur a l'un des rôles requis.
    Usage : Depends(require_role(UserRole.admin, UserRole.canope))
    """
    def checker(current_user: CurrentUser) -> Profile:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rôle requis : {[r.value for r in roles]}",
            )
        return current_user
    return checker
