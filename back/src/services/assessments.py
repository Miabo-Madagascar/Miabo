"""
Service bilans d'orientation — VAK, RIASEC, DISC.
Administrés par les acteurs CANOPE/COSP via leurs canope_profiles.
"""

import uuid
from sqlalchemy import or_
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.canope import Assessment
from src.models.canope_users import ExternalYoungProfile
from src.models.users import Profile
from src.models.enums import AssessmentStatus
from src.schemas.assessments import CreateAssessmentRequest, ValidateAssessmentRequest
from src.services.assessment_common import assessment_to_dict
from src.services.assessment_helpers import get_canope_profile, get_assessment as _get_assessment_row, PENDING_POOL


# ── Service ───────────────────────────────────────────────────────────────────

def list_assessments(db: DbSession, user: Profile) -> list[dict]:
    """Bilans administrés par l'acteur connecté + auto-bilans élève en attente de validation."""
    cp   = get_canope_profile(db, user)
    rows = db.query(Assessment).filter(
        or_(Assessment.administered_by == cp.id, PENDING_POOL)
    ).order_by(Assessment.created_at.desc()).all()
    return [assessment_to_dict(a, db) for a in rows]


def create_assessment(db: DbSession, user: Profile, data: CreateAssessmentRequest) -> dict:
    """Crée un bilan en brouillon (Option A : élève MIABO / Option B : jeune externe)."""
    # Validation de l'exclusivité Option A vs B
    option_a = data.student_profile_id is not None
    option_b = (data.external_young_id is not None) or (data.external_young_full_name is not None)

    if option_a == option_b: # XOR
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Renseignez student_profile_id (Option A) OU infos jeune externe (Option B).",
        )

    cp = get_canope_profile(db, user)

    external_id = None
    if option_b:
        if data.external_young_id and data.external_young_id != "pending":
            external_id = uuid.UUID(data.external_young_id)
        else:
            # Création automatique du profil jeune externe avec les champs CDC §6
            from datetime import date
            dob = date.fromisoformat(data.date_of_birth) if data.date_of_birth else date(2010, 1, 1)
            ey = ExternalYoungProfile(
                id=uuid.uuid4(),
                created_by=cp.id,
                full_name=data.external_young_full_name or "Jeune Externe",
                date_of_birth=dob,
                gender=data.gender or "autre",
                region=data.region or "Analamanga",
                quartier=data.quartier or None,
                school_name=data.school_name or None,
            )
            db.add(ey)
            db.flush()
            external_id = ey.id

    a  = Assessment(
        id                 = uuid.uuid4(),
        administered_by    = cp.id,
        student_profile_id = data.student_profile_id,
        external_young_id  = external_id,
        serie              = data.serie,
        career_interest    = data.career_interest,
        status             = AssessmentStatus.draft,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)


def validate_assessment(
    db: DbSession, assessment_id: str, user: Profile, data: ValidateAssessmentRequest,
) -> dict:
    """Valide le bilan — le rend immuable (sauf Admin). Requiert VAK + RIASEC + DISC."""
    from datetime import datetime, timezone
    cp = get_canope_profile(db, user)
    a  = _get_assessment_row(db, assessment_id, cp)
    if not (a.vak_dominant and a.riasec_code and a.disc_dominant):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Les 3 tests (VAK, RIASEC, DISC) doivent être complétés avant validation.",
        )
    # Le conseiller prend en charge un auto-bilan élève au moment de sa validation
    if a.administered_by is None:
        a.administered_by = cp.id
    a.actor_comment = data.actor_comment
    a.status        = AssessmentStatus.validated
    a.validated_at  = datetime.now(timezone.utc)
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)


def get_assessment_detail(db: DbSession, assessment_id: str, user: Profile) -> dict:
    """Retourne un bilan par son ID (acteur propriétaire uniquement)."""
    cp = get_canope_profile(db, user)
    return assessment_to_dict(_get_assessment_row(db, assessment_id, cp), db)
