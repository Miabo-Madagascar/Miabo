"""
Router évaluations orientation — VAK, RIASEC, DISC (CANOPE/COSP).
Préfixe : /api/v1/assessments
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/assessments", tags=["Évaluations"])


@router.post("/", status_code=201)
async def create_assessment(current_user: CurrentUser, db: DbDep):
    """Crée un bilan pour un élève ou jeune externe. TODO PHASE 3."""
    raise NotImplementedError


@router.put("/{assessment_id}/vak")
async def submit_vak(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Soumet les scores VAK (V:0-10, A:0-9, K:0-11). TODO PHASE 3."""
    raise NotImplementedError


@router.put("/{assessment_id}/riasec")
async def submit_riasec(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Soumet les 6 scores RIASEC → calcule le code 2 lettres. TODO PHASE 3."""
    raise NotImplementedError


@router.put("/{assessment_id}/disc")
async def submit_disc(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Soumet les scores DISC (D/I/S/C). TODO PHASE 3."""
    raise NotImplementedError


@router.put("/{assessment_id}/validate")
async def validate_assessment(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Valide le bilan (CANOPE/COSP uniquement). TODO PHASE 3."""
    raise NotImplementedError


@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Résultat et recommandations d'un bilan. TODO PHASE 3."""
    raise NotImplementedError
