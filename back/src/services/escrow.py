"""
Service escrow — logique de séquestre des paiements.
Flux : payment confirmed → hold → (48h) → released vers wallet tuteur.
Appelé par payments router et APScheduler.
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from src.models.payments import EscrowTransaction, Payment
from src.models.enums import EscrowStatus, PaymentStatus

ESCROW_HOLD_HOURS = 48   # délai avant libération automatique


def create_escrow(db: Session, payment_id: str, amount: int) -> EscrowTransaction:
    """Crée un escrow en état 'held' après confirmation du paiement."""
    release_at = datetime.now(timezone.utc) + timedelta(hours=ESCROW_HOLD_HOURS)
    escrow = EscrowTransaction(
        payment_id=payment_id,
        amount_ariary=amount,
        status=EscrowStatus.held,
        release_at=release_at,
    )
    db.add(escrow)
    db.commit()
    db.refresh(escrow)
    return escrow


def release_escrow(db: Session, escrow_id: str) -> EscrowTransaction | None:
    """
    Libère l'escrow vers le wallet tuteur.
    Appelé par APScheduler à release_at OU manuellement après session completed.
    """
    escrow = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == escrow_id,
        EscrowTransaction.status == EscrowStatus.held,
    ).first()
    if not escrow:
        return None

    escrow.status = EscrowStatus.released
    # TODO : créditer wallet tuteur (amount - commission)
    db.commit()
    db.refresh(escrow)
    return escrow


def dispute_escrow(
    db: Session,
    escrow_id: str,
    reason: str,
) -> EscrowTransaction | None:
    """Passe l'escrow en litige — bloque la libération automatique."""
    escrow = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == escrow_id,
        EscrowTransaction.status == EscrowStatus.held,
    ).first()
    if not escrow:
        return None

    escrow.status = EscrowStatus.disputed
    db.commit()
    db.refresh(escrow)
    return escrow
