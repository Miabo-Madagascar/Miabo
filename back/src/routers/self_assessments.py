"""
Router auto-bilan d'orientation — VAK, RIASEC, DISC (élève).
Préfixe : /api/v1/self-assessments
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser
from src.schemas.assessments import (
    CreateSelfAssessmentRequest, VakRequest, RiasecRequest, RiasecCodeRequest, DiscRequest,
)
from src.services import self_assessments as svc
from src.services import self_assessment_tests as svc_tests

router = APIRouter(prefix="/self-assessments", tags=["Bilans (auto-évaluation élève)"])


@router.get("/")
async def list_my_assessments(current_user: CurrentUser, db: DbDep):
    """Liste les bilans de l'élève connecté."""
    return svc.list_my_assessments(db, current_user)


@router.post("/", status_code=201)
async def create_self_assessment(
    body: CreateSelfAssessmentRequest, current_user: CurrentUser, db: DbDep,
):
    """Crée un auto-bilan en brouillon, lié au profil élève connecté."""
    return svc.create_self_assessment(db, current_user, body)


@router.get("/{assessment_id}")
async def get_my_assessment(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Retourne le détail d'un bilan de l'élève connecté."""
    return svc.get_my_assessment(db, assessment_id, current_user)


@router.put("/{assessment_id}/vak")
async def submit_vak(
    assessment_id: str, body: VakRequest, current_user: CurrentUser, db: DbDep,
):
    """Enregistre les scores VAK et calcule le profil dominant (V/A/K)."""
    return svc_tests.submit_vak(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/riasec")
async def submit_riasec(
    assessment_id: str, body: RiasecRequest, current_user: CurrentUser, db: DbDep,
):
    """Enregistre les scores RIASEC et calcule le code de Holland (3 lettres)."""
    return svc_tests.submit_riasec(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/riasec-code")
async def update_riasec_code(
    assessment_id: str, body: RiasecCodeRequest, current_user: CurrentUser, db: DbDep,
):
    """Met à jour le code de Holland choisi manuellement après résolution d'ex-aequo."""
    return svc_tests.update_riasec_code(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/disc")
async def submit_disc(
    assessment_id: str, body: DiscRequest, current_user: CurrentUser, db: DbDep,
):
    """Enregistre les scores DISC et calcule le profil dominant (D/I/S/C)."""
    return svc_tests.submit_disc(db, assessment_id, current_user, body)


@router.put("/{assessment_id}/submit")
async def submit_for_validation(assessment_id: str, current_user: CurrentUser, db: DbDep):
    """Soumet le bilan complété pour relecture par un conseiller CANOPE/COSP."""
    return svc.submit_for_validation(db, assessment_id, current_user)
