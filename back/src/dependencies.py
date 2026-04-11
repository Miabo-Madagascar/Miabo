"""
Dépendances FastAPI partagées — injectées via Depends().
Centralise : session BDD, utilisateur courant, contrôle de rôle.

Validation JWT :
- Supabase utilise désormais ECC (P-256) → algorithme ES256.
- Les clés publiques sont récupérées via le endpoint JWKS de Supabase.
- Fallback HS256 via SUPABASE_JWT_SECRET si SUPABASE_URL absent.
"""

import os
import uuid
from typing import Generator, Annotated

import httpx
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

# ── Récupération des clés publiques JWKS ──────────────────────────────────

_jwks_cache: dict | None = None

def _get_jwks() -> dict:
    """
    Récupère les clés publiques Supabase depuis le endpoint JWKS.
    Mise en cache en mémoire pour éviter un appel HTTP à chaque requête.
    """
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not supabase_url:
        return {}

    try:
        response = httpx.get(
            f"{supabase_url}/auth/v1/.well-known/jwks.json",
            timeout=5,
        )
        response.raise_for_status()
        _jwks_cache = response.json()
        return _jwks_cache
    except Exception:
        return {}

# ── Décodage JWT — ES256 (ECC) ou HS256 (legacy) ──────────────────────────

def _decode_jwt(token: str) -> dict:
    """
    Tente de décoder le JWT en ES256 (clé ECC Supabase) puis en HS256 (legacy).
    Lève JWTError si les deux échouent.
    """
    # Tentative ES256 via JWKS
    jwks = _get_jwks()
    if jwks:
        try:
            return jwt.decode(
                token,
                jwks,
                algorithms=["ES256", "RS256"],
                options={"verify_aud": False},
            )
        except JWTError:
            pass

    # Fallback HS256 — Legacy JWT Secret (Supabase > Settings > JWT Keys > Legacy)
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
    return jwt.decode(
        token,
        jwt_secret,
        algorithms=["HS256"],
        options={"verify_aud": False},
    )

# ── Auth JWT Supabase ──────────────────────────────────────────────────────

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: DbDep,
) -> Profile:
    """Valide le JWT Supabase et retourne le profil BDD."""
    try:
        payload = _decode_jwt(credentials.credentials)
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
        # ── Fallback : créer le profil depuis les métadonnées du JWT ──────────
        # Cela se produit si le trigger PostgreSQL Supabase n'est pas configuré
        # ou si la route /api/auth/callback n'a pas pu joindre le backend.
        meta = payload.get("user_metadata") or {}
        raw_full_name = meta.get("full_name") or payload.get("email", "Utilisateur")
        raw_role      = meta.get("role", "student")

        # Valider le rôle
        try:
            role = UserRole(raw_role)
        except ValueError:
            role = UserRole.student

        # Seuls les rôles d'auto-inscription sont autorisés
        if role not in (UserRole.student, UserRole.tutor, UserRole.parent, UserRole.canope, UserRole.cosp):
            role = UserRole.student

        # Créer le profil de base COMPLET (avec sous-profil métier)
        email = payload.get("email") or ""
        try:
            from src.services.auth import create_profile as auth_create_profile
            profile = auth_create_profile(
                db=db,
                user_id=user_id,
                email=email,
                full_name=raw_full_name,
                role=role,
                locale="fr",
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Profil introuvable — inscription incomplète ({str(e)})",
            )

    if not profile.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte suspendu")

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
