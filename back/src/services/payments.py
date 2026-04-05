"""
Service paiements — initiation MVola/Orange, webhooks, escrow, wallet tuteur.
Commission MIABO : 10% prélevée au déblocage de l'escrow.
"""

import hashlib
import hmac
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.payments import Payment, EscrowTransaction
from src.models.sessions import Session as SessionModel
from src.models.profiles import TutorProfile
from src.models.users import Profile
from src.models.enums import (
    PaymentMethod, PaymentStatus, EscrowStatus, SessionStatus
)

# Délai de déblocage escrow après fin de session (CDC §PAY-003)
ESCROW_HOLD_HOURS = 24


# ── Initiation paiement ───────────────────────────────────────────────────

def initiate_payment(
    db:           DbSession,
    payer:        Profile,
    session_id:   str,
    amount_ariary: int,
    method:       PaymentMethod,
    phone_number: str,
) -> dict:
    """
    Crée un enregistrement Payment en statut 'pending'.
    En production : appelle l'API MVola/Orange et retourne le ref externe.
    En sandbox : simule l'initiation et retourne un ref fictif.
    """
    # Vérifie qu'un seul paiement par session
    existing = db.query(Payment).filter(Payment.session_id == session_id).first()
    if existing and existing.status != PaymentStatus.failed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un paiement existe déjà pour cette session",
        )

    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session introuvable",
        )
    if session.status != SessionStatus.confirmed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La session doit être confirmée avant paiement",
        )

    # Crée le payment en 'pending'
    payment = Payment(
        id=uuid.uuid4(),
        session_id=session_id,
        payer_id=payer.id,
        amount_ariary=amount_ariary,
        payment_method=method,
        status=PaymentStatus.pending,
        phone_number=phone_number,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Simule l'appel API Mobile Money (sandbox)
    # En production : POST vers API MVola/Orange avec auth Bearer
    external_ref = f"MIABO-{str(payment.id)[:8].upper()}"
    payment.external_ref = external_ref
    payment.status = PaymentStatus.processing
    db.commit()
    db.refresh(payment)

    return payment_to_dict(payment)


def confirm_payment_webhook(
    db:           DbSession,
    external_ref: str,
    webhook_status: str,
    amount:       int,
    signature:    str,
    secret:       str,
) -> dict:
    """
    Traite le callback webhook MVola/Orange.
    Vérifie la signature HMAC puis met à jour le statut.
    Si succès → crée l'escrow, passe la session en in_progress.
    """
    # Vérification HMAC (signature = HMAC-SHA256(external_ref + amount, secret))
    expected = hmac.new(
        secret.encode(),
        f"{external_ref}{amount}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signature webhook invalide",
        )

    payment = db.query(Payment).filter(
        Payment.external_ref == external_ref
    ).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement introuvable",
        )

    if webhook_status == "success":
        payment.status = PaymentStatus.completed
        payment.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(payment)
        _create_escrow(db, payment)
    else:
        payment.status = PaymentStatus.failed
        db.commit()

    return payment_to_dict(payment)


# ── Simulation confirmation (sandbox dev) ────────────────────────────────

def simulate_payment_confirmation(db: DbSession, payment_id: str) -> dict:
    """
    Simule la confirmation push Mobile Money en sandbox.
    Passe le paiement à 'completed' et crée l'escrow.
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement introuvable",
        )
    if payment.status != PaymentStatus.processing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Paiement non confirmable (statut: {payment.status.value})",
        )

    payment.status = PaymentStatus.completed
    payment.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)
    _create_escrow(db, payment)
    return payment_to_dict(payment)


# ── Escrow ────────────────────────────────────────────────────────────────

def _create_escrow(db: DbSession, payment: Payment) -> EscrowTransaction:
    """
    Crée la transaction escrow après paiement confirmé.
    Montant net = 90% du paiement (10% commission MIABO).
    Déblocage programmé à now() + ESCROW_HOLD_HOURS.
    """
    session = db.query(SessionModel).filter(
        SessionModel.id == payment.session_id
    ).first()

    net_amount = round(payment.amount_ariary * 0.9)  # 90% après commission
    release_at = datetime.now(timezone.utc) + timedelta(hours=ESCROW_HOLD_HOURS)

    escrow = EscrowTransaction(
        id=uuid.uuid4(),
        payment_id=payment.id,
        tutor_id=session.tutor_id,
        amount_ariary=net_amount,
        status=EscrowStatus.held,
        release_at=release_at,
    )
    db.add(escrow)

    # Passe la session en in_progress
    session.status = SessionStatus.in_progress
    db.commit()
    db.refresh(escrow)
    return escrow


def release_escrow(db: DbSession, escrow_id: str) -> dict:
    """
    Libère les fonds escrow vers le wallet du tuteur.
    Appelé manuellement (admin) ou automatiquement par le scheduler.
    """
    escrow = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == escrow_id
    ).first()
    if not escrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escrow introuvable",
        )
    if escrow.status != EscrowStatus.held:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Escrow non libérable (statut: {escrow.status.value})",
        )

    # Crédite le wallet du tuteur
    tutor_profile = db.query(TutorProfile).filter(
        TutorProfile.profile_id == escrow.tutor_id
    ).first()
    if tutor_profile:
        tutor_profile.wallet_balance = (tutor_profile.wallet_balance or 0) + escrow.amount_ariary

    escrow.status = EscrowStatus.released
    escrow.released_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(escrow)
    return escrow_to_dict(escrow)


def release_due_escrows(db: DbSession) -> int:
    """
    Libère tous les escrows dont release_at est dépassé.
    Appelé par le scheduler APScheduler toutes les heures.
    Retourne le nombre d'escrows libérés.
    """
    now = datetime.now(timezone.utc)
    due = db.query(EscrowTransaction).filter(
        EscrowTransaction.status == EscrowStatus.held,
        EscrowTransaction.release_at <= now,
    ).all()

    count = 0
    for escrow in due:
        try:
            release_escrow(db, str(escrow.id))
            count += 1
        except Exception:
            pass  # Log en production
    return count


# ── Wallet ────────────────────────────────────────────────────────────────

def get_wallet(db: DbSession, tutor: Profile) -> dict:
    """Retourne le solde et l'historique escrow du tuteur."""
    profile = db.query(TutorProfile).filter(
        TutorProfile.profile_id == tutor.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil tuteur introuvable",
        )

    escrows = db.query(EscrowTransaction).filter(
        EscrowTransaction.tutor_id == tutor.id
    ).order_by(EscrowTransaction.released_at.desc()).limit(20).all()

    held_amount = sum(
        e.amount_ariary for e in escrows if e.status == EscrowStatus.held
    )

    return {
        "wallet_balance":  profile.wallet_balance or 0,
        "pending_escrow":  held_amount,
        "total_available": (profile.wallet_balance or 0),
        "transactions":    [escrow_to_dict(e) for e in escrows],
    }


# ── Sérialisation ─────────────────────────────────────────────────────────

def payment_to_dict(p: Payment) -> dict:
    return {
        "id":               str(p.id),
        "session_id":       str(p.session_id),
        "payer_id":         str(p.payer_id),
        "amount_ariary":    p.amount_ariary,
        "commission_ariary": p.commission_ariary,
        "payment_method":   p.payment_method.value,
        "status":           p.status.value,
        "external_ref":     p.external_ref,
        "phone_number":     p.phone_number,
        "created_at":       p.created_at.isoformat() if p.created_at else None,
        "completed_at":     p.completed_at.isoformat() if p.completed_at else None,
    }


def escrow_to_dict(e: EscrowTransaction) -> dict:
    return {
        "id":            str(e.id),
        "payment_id":    str(e.payment_id),
        "tutor_id":      str(e.tutor_id),
        "amount_ariary": e.amount_ariary,
        "status":        e.status.value,
        "release_at":    e.release_at.isoformat() if e.release_at else None,
        "released_at":   e.released_at.isoformat() if e.released_at else None,
    }
