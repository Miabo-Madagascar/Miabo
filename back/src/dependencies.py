"""
Dépendances FastAPI partagées — injectées via Depends().
Centralise : session BDD, utilisateur courant, contrôle de rôle.
"""

from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.config.database import SessionLocal
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
) -> dict:
    """
    Valide le JWT Supabase et retourne le profil utilisateur.
    TODO PHASE 1 : décoder le JWT avec python-jose + SUPABASE_JWT_SECRET.
    """
    # token = credentials.credentials
    # payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
    # user_id = payload.get("sub")
    # profile = db.query(Profile).filter(Profile.id == user_id).first()
    # if not profile: raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    # return profile
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentification non implémentée — PHASE 1",
    )

CurrentUser = Annotated[dict, Depends(get_current_user)]

# ── Contrôle de rôle ───────────────────────────────────────────────────────

def require_role(*roles: UserRole):
    """
    Dependency factory — vérifie que l'utilisateur a l'un des rôles requis.
    Usage : Depends(require_role(UserRole.admin, UserRole.canope))
    """
    def checker(current_user: CurrentUser) -> dict:
        if current_user.get("role") not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé — rôle insuffisant",
            )
        return current_user
    return checker
