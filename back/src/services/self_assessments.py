"""
Service auto-bilan d'orientation — VAK, RIASEC, DISC.
Administré par l'élève lui-même (administered_by = NULL), soumis ensuite
à la relecture d'un acteur CANOPE/COSP (statut pending_validation).
"""

import uuid
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.canope import Assessment
from src.models.users import Profile
from src.models.enums import AssessmentStatus
from src.schemas.assessments import CreateSelfAssessmentRequest
from src.services.assessment_common import assessment_to_dict
from src.services.self_assessment_helpers import (
    get_student_profile, get_my_assessment as get_assessment_row, get_editable_assessment,
)

# ── Service ───────────────────────────────────────────────────────────────────

def list_my_assessments(db: DbSession, user: Profile) -> list[dict]:
    """Tous les bilans de l'élève connecté, du plus récent au plus ancien."""
    sp   = get_student_profile(db, user)
    rows = db.query(Assessment).filter(
        Assessment.student_profile_id == sp.id
    ).order_by(Assessment.created_at.desc()).all()
    return [assessment_to_dict(a, db) for a in rows]


def create_self_assessment(db: DbSession, user: Profile, data: CreateSelfAssessmentRequest) -> dict:
    """Crée un auto-bilan en brouillon, lié au profil élève connecté."""
    sp = get_student_profile(db, user)
    a  = Assessment(
        id                 = uuid.uuid4(),
        administered_by    = None,
        student_profile_id = sp.id,
        serie              = data.serie,
        career_interest    = data.career_interest,
        status             = AssessmentStatus.draft,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)


def get_my_assessment(db: DbSession, assessment_id: str, user: Profile) -> dict:
    """Retourne un bilan de l'élève connecté par son ID."""
    sp = get_student_profile(db, user)
    return assessment_to_dict(get_assessment_row(db, assessment_id, sp), db)


def submit_for_validation(db: DbSession, assessment_id: str, user: Profile) -> dict:
    """Soumet le bilan complété pour relecture par un conseiller CANOPE/COSP."""
    sp = get_student_profile(db, user)
    a  = get_editable_assessment(db, assessment_id, sp)
    if not (a.vak_dominant and a.riasec_code and a.disc_dominant):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Les 3 tests (VAK, RIASEC, DISC) doivent être complétés avant soumission.",
        )
    a.status = AssessmentStatus.pending_validation
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)
