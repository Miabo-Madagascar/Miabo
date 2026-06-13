"""
Helpers BDD partagés — bilans CANOPE/COSP (assessments.py, assessment_tests.py).
"""

from sqlalchemy import or_
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.canope import Assessment
from src.models.canope_users import CanopProfile
from src.models.users import Profile
from src.models.enums import AssessmentStatus


def get_canope_profile(db: DbSession, user: Profile) -> CanopProfile:
    cp = db.query(CanopProfile).filter(CanopProfile.profile_id == user.id).first()
    if not cp:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Profil CANOPE/COSP introuvable")
    return cp


# Auto-bilans élève terminés, en attente de relecture par n'importe quel acteur CANOPE/COSP
PENDING_POOL = (
    Assessment.administered_by.is_(None)
    & (Assessment.status == AssessmentStatus.pending_validation)
)


def get_assessment(db: DbSession, assessment_id: str, cp: CanopProfile) -> Assessment:
    a = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        or_(Assessment.administered_by == cp.id, PENDING_POOL),
    ).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bilan introuvable")
    return a
