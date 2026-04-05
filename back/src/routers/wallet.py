"""
Router wallet tuteur — solde, retrait, historique.
Préfixe : /api/v1/wallet
CDC endpoint : POST /withdraw
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/")
async def get_wallet(current_user: CurrentUser, db: DbDep):
    """Solde et historique du wallet tuteur. TODO PHASE 4."""
    raise NotImplementedError


@router.post("/withdraw")
async def request_withdrawal(current_user: CurrentUser, db: DbDep):
    """
    Demande de virement vers MVola/Orange du tuteur.
    Requiert KYC validé. TODO PHASE 4.
    """
    raise NotImplementedError
