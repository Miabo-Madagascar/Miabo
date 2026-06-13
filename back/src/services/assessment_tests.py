"""
Service bilans d'orientation — soumission des scores VAK, RIASEC, DISC (CANOPE/COSP).
"""

from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.users import Profile
from src.models.enums import AssessmentStatus
from src.schemas.assessments import VakRequest, RiasecRequest, RiasecCodeRequest, DiscRequest
from src.services.assessment_common import (
    vak_dominant, riasec_code as compute_riasec_code, disc_dominant, assessment_to_dict,
)
from src.services.assessment_helpers import get_canope_profile, get_assessment


def submit_vak(db: DbSession, assessment_id: str, user: Profile, data: VakRequest) -> dict:
    """Enregistre les scores VAK et calcule le profil dominant."""
    cp = get_canope_profile(db, user)
    a  = get_assessment(db, assessment_id, cp)
    a.vak_v_score  = data.v_score
    a.vak_a_score  = data.a_score
    a.vak_k_score  = data.k_score
    a.vak_dominant = vak_dominant(data.v_score, data.a_score, data.k_score)
    a.status       = AssessmentStatus.in_progress
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)


def submit_riasec(db: DbSession, assessment_id: str, user: Profile, data: RiasecRequest) -> dict:
    """Enregistre les scores RIASEC et calcule le code de Holland (3 lettres)."""
    cp     = get_canope_profile(db, user)
    a      = get_assessment(db, assessment_id, cp)
    scores = {"R": data.R, "I": data.I, "A": data.A, "S": data.S, "E": data.E, "C": data.C}
    a.riasec_scores = scores
    a.riasec_code   = compute_riasec_code(scores)
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)


def update_riasec_code(db: DbSession, assessment_id: str, user: Profile, data: RiasecCodeRequest) -> dict:
    """Sauvegarde le code de Holland choisi manuellement après résolution d'ex-aequo."""
    cp = get_canope_profile(db, user)
    a  = get_assessment(db, assessment_id, cp)
    if not a.riasec_scores:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Le test RIASEC n'a pas encore été soumis.")
    a.riasec_code = data.code
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)


def submit_disc(db: DbSession, assessment_id: str, user: Profile, data: DiscRequest) -> dict:
    """Enregistre les scores DISC et calcule le profil dominant."""
    cp     = get_canope_profile(db, user)
    a      = get_assessment(db, assessment_id, cp)
    scores = {"D": data.D, "I": data.I, "S": data.S, "C": data.C}
    a.disc_scores   = scores
    a.disc_dominant = disc_dominant(scores)
    db.commit()
    db.refresh(a)
    return assessment_to_dict(a, db)
