"""
Schémas Pydantic — Paiements, escrow, wallet.
"""

from pydantic import BaseModel, field_validator
from src.models.enums import PaymentStatus, EscrowStatus, PaymentMethod

MIN_AMOUNT = 1_000    # Ariary
MAX_AMOUNT = 500_000  # Ariary


class InitiatePaymentRequest(BaseModel):
    session_id:    str
    amount_ariary: int
    method:        PaymentMethod
    phone_number:  str   # numéro MVola/Orange du payeur

    @field_validator("amount_ariary")
    @classmethod
    def valid_amount(cls, v: int) -> int:
        if not (MIN_AMOUNT <= v <= MAX_AMOUNT):
            raise ValueError(f"Montant entre {MIN_AMOUNT} et {MAX_AMOUNT} Ar")
        return v


class PaymentWebhookRequest(BaseModel):
    """Payload reçu de MVola/Orange après confirmation push."""
    transaction_id:   str
    external_ref:     str
    status:           str
    amount:           int
    signature:        str   # HMAC à vérifier


class WithdrawRequest(BaseModel):
    amount_ariary: int
    method:        PaymentMethod
    phone_number:  str


class PaymentResponse(BaseModel):
    payment_id:    str
    status:        PaymentStatus
    amount_ariary: int
    commission:    int
    method:        PaymentMethod
    created_at:    str

    model_config = {"from_attributes": True}


class EscrowResponse(BaseModel):
    escrow_id:   str
    status:      EscrowStatus
    held_amount: int
    release_at:  str | None

    model_config = {"from_attributes": True}
