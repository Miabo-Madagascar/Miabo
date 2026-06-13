"""
Helpers BDD partagés — auto-bilan élève (self_assessments.py, self_assessment_tests.py).
"""

from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.canope import Assessment
from src.models.profiles import StudentProfile
from src.models.users import Profile


def get_student_profile(db: DbSession, user: Profile) -> StudentProfile:
    sp = db.query(StudentProfile).filter(StudentProfile.profile_id == user.id).first()
    if not sp:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Profil élève introuvable")
    return sp


def get_my_assessment(db: DbSession, assessment_id: str, sp: StudentProfile) -> Assessment:
    """Tous les bilans liés à l'élève (y compris ceux administrés par un conseiller)."""
    a = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.student_profile_id == sp.id,
    ).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bilan introuvable")
    return a


def get_editable_assessment(db: DbSession, assessment_id: str, sp: StudentProfile) -> Assessment:
    """Seuls les auto-bilans (administered_by IS NULL) restent modifiables par l'élève."""
    a = get_my_assessment(db, assessment_id, sp)
    if a.administered_by is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bilan introuvable")
    return a
