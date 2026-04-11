"""
Router administration — KPIs, gestion utilisateurs, analytics.
Préfixe : /api/v1/admin
"""

from fastapi import APIRouter, HTTPException, status
from src.dependencies import DbDep, CurrentUser, require_role
from src.models.enums import UserRole

router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
    dependencies=[],  # require_role injecté par endpoint pour des messages d'erreur précis
)

_ADMIN_ONLY = require_role(UserRole.admin)


@router.get("/analytics/platform")
async def get_platform_analytics(current_user: CurrentUser, db: DbDep):
    """KPIs plateforme : utilisateurs, sessions, revenus, escrow. TODO Phase 6."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Réservé à l'administration")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Analytics non encore implémentés")


@router.get("/users")
async def list_users(current_user: CurrentUser, db: DbDep):
    """Liste tous les utilisateurs avec filtres. TODO Phase 6."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Réservé à l'administration")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Liste utilisateurs non encore implémentée")


@router.put("/users/{user_id}/suspend")
async def suspend_user(user_id: str, current_user: CurrentUser, db: DbDep):
    """Suspend un compte utilisateur. TODO Phase 6."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Réservé à l'administration")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Suspension non encore implémentée")


@router.get("/tutors/pending")
async def list_pending_tutors(current_user: CurrentUser, db: DbDep):
    """Liste les tuteurs en attente de validation. Utilisable par CANOPE."""
    if current_user.role not in (UserRole.admin, UserRole.canope):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Réservé à l'administration et aux acteurs CANOPE")
    from src.models.users import Profile
    from src.models.profiles import TutorProfile
    
    rows = (
        db.query(TutorProfile, Profile)
        .join(Profile, Profile.id == TutorProfile.profile_id)
        .filter(TutorProfile.validation_status == "pending")
        .all()
    )
    
    from src.services.profiles import _tutor_public_dict
    
    # We include some extra info like the email, since it's an admin/canope endpoint
    results = []
    for tp, p in rows:
        data = _tutor_public_dict(tp, p)
        data["email"] = p.email
        data["phone"] = p.phone
        data["created_at"] = p.created_at.isoformat() if p.created_at else None
        data["validation_status"] = tp.validation_status.value
        results.append(data)
        
    return results


@router.get("/escrow")
async def list_escrow_transactions(current_user: CurrentUser, db: DbDep):
    """Vue d'ensemble des transactions escrow en cours. TODO Phase 6."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Réservé à l'administration")
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                        detail="Escrow analytics non encore implémentés")
