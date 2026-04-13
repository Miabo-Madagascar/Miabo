"""
Router bilans d'orientation — VAK, RIASEC, DISC (CANOPE/COSP).
Préfixe : /api/v1/assessments
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser
from src.schemas.assessments import (
    CreateAssessmentRequest, VakRequest, RiasecRequest,
    DiscRequest, ValidateAssessmentRequest,
)
from src.services import assessments as svc

router = APIRouter(prefix="/assessments", tags=["Évaluations"])


@router.get("/stats")
async def get_stats(current_user: CurrentUser, db: DbDep):
    """Statistiques agrégées des bilans pour le dashboard CANOPE/COSP."""
    return svc.get_assessment_stats(db, current_user)


@router.get("/")
async def list_assessments(current_user: CurrentUser, db: DbDep):
    """Liste les bilans administrés par l'acteur connecté."""
    return svc.list_assessments(db, current_user)


@router.post("/", status_code=201)
async def create_assessment(
    body: CreateAssessmentRequest, current_user: CurrentUser, db: DbDep,
):
    """Crée un bilan en brouillon (Option A : élève MIABO / Option B : jeune externe)."""
    return svc.create_assessment(db, current_user, body)


@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Retourne le détail d'un bilan."""
    return svc.get_assessment(db, assessment_id, current_user)


@router.put("/{assessment_id}/vak")
async def submit_vak(
    assessment_id: str, body: VakRequest, current_user: CurrentUser, db: DbDep,
):
    """Enregistre les scores VAK et calcule le profil dominant (V/A/K)."""
    return svc.submit_vak(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/riasec")
async def submit_riasec(
    assessment_id: str, body: RiasecRequest, current_user: CurrentUser, db: DbDep,
):
    """Enregistre les scores RIASEC et calcule le code 2 lettres."""
    return svc.submit_riasec(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/disc")
async def submit_disc(
    assessment_id: str, body: DiscRequest, current_user: CurrentUser, db: DbDep,
):
    """Enregistre les scores DISC et calcule le profil dominant (D/I/S/C)."""
    return svc.submit_disc(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/validate")
async def validate_assessment(
    assessment_id: str, body: ValidateAssessmentRequest,
    current_user: CurrentUser, db: DbDep,
):
    """Valide le bilan — requiert VAK + RIASEC + DISC complétés."""
    return svc.validate_assessment(db, assessment_id, current_user, body)
