"""
Router matching — score compatibilité, recommandations tuteurs.
Préfixe : /api/v1/matching
CDC endpoints : POST /score, GET /recommendations
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/matching", tags=["Matching"])


@router.post("/score")
async def compute_compatibility_score(current_user: CurrentUser, db: DbDep):
    """
    Calcul du score de compatibilité élève–tuteur basé sur :
    - Codes RIASEC (lettres communes)
    - Profil VAK vs style d'enseignement tuteur
    - Historique sessions
    TODO PHASE 2.
    """
    raise NotImplementedError


@router.get("/recommendations")
async def get_recommendations(current_user: CurrentUser, db: DbDep):
    """
    Tuteurs recommandés pour l'élève connecté.
    Collaborative filtering — actif après 3 sessions min. TODO PHASE 2.
    """
    raise NotImplementedError
