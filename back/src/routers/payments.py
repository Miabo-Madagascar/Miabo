"""
Router paiements — MVola, Orange Money, webhooks.
Préfixe : /api/v1/payments
CDC endpoints : POST mvola/initiate, POST mvola/callback, POST orange/initiate
"""

from fastapi import APIRouter, Request
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/payments", tags=["Paiements"])


@router.post("/mvola/initiate")
async def initiate_mvola(current_user: CurrentUser, db: DbDep):
    """Initie un paiement MVola Telma. TODO PHASE 4."""
    raise NotImplementedError


@router.post("/mvola/callback")
async def mvola_webhook(request: Request, db: DbDep):
    """
    Webhook MVola — confirme le paiement après validation push.
    Vérifie la signature HMAC avant de traiter. TODO PHASE 4.
    """
    raise NotImplementedError


@router.post("/orange/initiate")
async def initiate_orange(current_user: CurrentUser, db: DbDep):
    """Initie un paiement Orange Money Madagascar. TODO PHASE 4."""
    raise NotImplementedError


@router.post("/orange/callback")
async def orange_webhook(request: Request, db: DbDep):
    """Webhook Orange Money. Vérifie la signature avant traitement. TODO PHASE 4."""
    raise NotImplementedError


@router.get("/{payment_id}")
async def get_payment(payment_id: str, current_user: CurrentUser, db: DbDep):
    """Détail d'un paiement (payeur, tuteur, admin). TODO PHASE 4."""
    raise NotImplementedError
