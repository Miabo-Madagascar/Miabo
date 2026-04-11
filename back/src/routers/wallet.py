"""
Router wallet tuteur — solde, historique, retrait.
Préfixe : /api/v1/wallet
"""

from fastapi import APIRouter, HTTPException, status
from src.dependencies import DbDep, CurrentUser
from src.schemas.payments import WithdrawRequest
from src.models.enums import UserRole
from src.services import payments as payments_svc

router = APIRouter(prefix="/wallet", tags=["Wallet"])

WITHDRAW_MIN = 5_000   # Ariary (CDC §PAY-004)


@router.get("/")
async def get_wallet(current_user: CurrentUser, db: DbDep):
    """Solde, escrow en attente et historique des transactions."""
    if current_user.role != UserRole.tutor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux tuteurs",
        )
    return payments_svc.get_wallet(db, current_user)


@router.post("/withdraw")
async def request_withdrawal(
    body: WithdrawRequest,
    current_user: CurrentUser,
    db: DbDep,
):
    """
    Demande de virement vers Mobile Money.
    Requiert KYC validé et solde suffisant (min 5 000 Ar).
    """
    if current_user.role != UserRole.tutor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux tuteurs",
        )
    if body.amount_ariary < WITHDRAW_MIN:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Montant minimum de retrait : {WITHDRAW_MIN} Ar",
        )

    from src.models.profiles import TutorProfile
    tutor_profile = db.query(TutorProfile).filter(
        TutorProfile.profile_id == current_user.id
    ).first()
    if not tutor_profile or not tutor_profile.kyc_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KYC non validé — contactez l'administration",
        )
    if (tutor_profile.wallet_balance or 0) < body.amount_ariary:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Solde insuffisant",
        )

    # Débite le wallet (en production : appel API Mobile Money)
    tutor_profile.wallet_balance -= body.amount_ariary
    db.commit()

    return {
        "success":      True,
        "amount_ariary": body.amount_ariary,
        "method":       body.method.value,
        "phone_number": body.phone_number,
        "new_balance":  tutor_profile.wallet_balance,
    }


@router.post("/escrow/{escrow_id}/release")
async def admin_release_escrow(
    escrow_id: str,
    current_user: CurrentUser,
    db: DbDep,
):
    """Libère manuellement un escrow (admin uniquement)."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé à l'administration",
        )
    return payments_svc.release_escrow(db, escrow_id)
