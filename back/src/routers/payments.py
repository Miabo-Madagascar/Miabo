"""
Router paiements — MVola, Orange Money, escrow, wallet.
Préfixe : /api/v1/payments
"""

import os
from fastapi import APIRouter, Request, Query
from src.dependencies import DbDep, CurrentUser
from src.schemas.payments import InitiatePaymentRequest, PaymentWebhookRequest
from src.models.enums import PaymentMethod
from src.services import payments as payments_svc

router = APIRouter(prefix="/payments", tags=["Paiements"])

MVOLA_WEBHOOK_SECRET = os.getenv("MVOLA_WEBHOOK_SECRET", "dev-secret")
ORANGE_WEBHOOK_SECRET = os.getenv("ORANGE_WEBHOOK_SECRET", "dev-secret")


@router.post("/mvola/initiate")
async def initiate_mvola(
    body: InitiatePaymentRequest,
    current_user: CurrentUser,
    db: DbDep,
):
    """Initie un paiement MVola Telma."""
    return payments_svc.initiate_payment(
        db, current_user,
        session_id=body.session_id,
        amount_ariary=body.amount_ariary,
        method=PaymentMethod.mvola,
        phone_number=body.phone_number,
    )


@router.post("/mvola/callback")
async def mvola_webhook(body: PaymentWebhookRequest, db: DbDep):
    """Webhook MVola — confirme après validation push utilisateur."""
    return payments_svc.confirm_payment_webhook(
        db,
        external_ref=body.external_ref,
        webhook_status=body.status,
        amount=body.amount,
        signature=body.signature,
        secret=MVOLA_WEBHOOK_SECRET,
    )


@router.post("/orange/initiate")
async def initiate_orange(
    body: InitiatePaymentRequest,
    current_user: CurrentUser,
    db: DbDep,
):
    """Initie un paiement Orange Money Madagascar."""
    return payments_svc.initiate_payment(
        db, current_user,
        session_id=body.session_id,
        amount_ariary=body.amount_ariary,
        method=PaymentMethod.orange_money,
        phone_number=body.phone_number,
    )


@router.post("/orange/callback")
async def orange_webhook(body: PaymentWebhookRequest, db: DbDep):
    """Webhook Orange Money."""
    return payments_svc.confirm_payment_webhook(
        db,
        external_ref=body.external_ref,
        webhook_status=body.status,
        amount=body.amount,
        signature=body.signature,
        secret=ORANGE_WEBHOOK_SECRET,
    )


@router.post("/{payment_id}/simulate-confirm")
async def simulate_confirm(
    payment_id: str,
    current_user: CurrentUser,
    db: DbDep,
):
    """
    Sandbox uniquement — simule la confirmation push Mobile Money.
    Permet de tester le flux complet sans API réelle.
    """
    return payments_svc.simulate_payment_confirmation(db, payment_id)


@router.get("/{payment_id}")
async def get_payment(payment_id: str, current_user: CurrentUser, db: DbDep):
    """Détail d'un paiement."""
    from src.models.payments import Payment
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Paiement introuvable")
    return payments_svc.payment_to_dict(payment)
