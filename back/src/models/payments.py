"""
Modèles SQLAlchemy — domaine Paiement & Escrow.
Tables : payments, escrow_transactions
"""

import uuid
from sqlalchemy import (CheckConstraint, Column, Computed, Enum,
                         Integer, Text, ForeignKey, UniqueConstraint)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base
from .enums import EscrowStatus, PaymentMethod, PaymentStatus


class Payment(Base):
    """
    Transaction de paiement Mobile Money — 1 par session maximum.
    La commission (10%) est une colonne générée côté PostgreSQL.
    """
    __tablename__ = "payments"

    id                = Column(UUID(as_uuid=True), primary_key=True,
                               default=uuid.uuid4)
    session_id        = Column(UUID(as_uuid=True),
                               ForeignKey("sessions.id", ondelete="RESTRICT"),
                               nullable=False, index=True)
    payer_id          = Column(UUID(as_uuid=True),
                               ForeignKey("profiles.id", ondelete="RESTRICT"),
                               nullable=False, index=True)
    amount_ariary     = Column(Integer, nullable=False)
    # Colonne générée : commission MIABO = 10% du montant (persisted)
    commission_ariary = Column(Integer, Computed("amount_ariary / 10",
                                                  persisted=True))
    payment_method    = Column(Enum(PaymentMethod, name="payment_method"),
                               nullable=False)
    status            = Column(Enum(PaymentStatus, name="payment_status"),
                               nullable=False, server_default="pending")
    external_ref      = Column(Text)
    phone_number      = Column(Text, nullable=False)
    created_at        = Column(TIMESTAMP(timezone=True), server_default=func.now())
    completed_at      = Column(TIMESTAMP(timezone=True))

    __table_args__ = (
        UniqueConstraint("session_id", name="uq_payment_session"),
        CheckConstraint("amount_ariary > 0", name="chk_payment_amount_positive"),
    )


class EscrowTransaction(Base):
    """
    Fonds en séquestre — bloqués jusqu'à 24h après la fin de la session.
    Libération automatique gérée par APScheduler dans FastAPI.
    Montant net = payment.amount_ariary − commission (90% du total).
    """
    __tablename__ = "escrow_transactions"

    id            = Column(UUID(as_uuid=True), primary_key=True,
                           default=uuid.uuid4)
    payment_id    = Column(UUID(as_uuid=True),
                           ForeignKey("payments.id", ondelete="RESTRICT"),
                           nullable=False, unique=True)
    tutor_id      = Column(UUID(as_uuid=True),
                           ForeignKey("profiles.id", ondelete="RESTRICT"),
                           nullable=False, index=True)
    amount_ariary = Column(Integer, nullable=False)
    status        = Column(Enum(EscrowStatus, name="escrow_status"),
                           nullable=False, server_default="held")
    release_at    = Column(TIMESTAMP(timezone=True), nullable=False)
    released_at   = Column(TIMESTAMP(timezone=True))

    __table_args__ = (
        CheckConstraint("amount_ariary > 0", name="chk_escrow_amount_positive"),
    )
