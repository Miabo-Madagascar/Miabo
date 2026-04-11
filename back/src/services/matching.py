"""
Service matching — scoring RIASEC, recommandations tuteurs.
"""

from sqlalchemy.orm import Session
from src.models.profiles import TutorProfile, StudentProfile


def compute_riasec_score(student_code: str, tutor_code: str) -> float:
    """
    Calcule le score de compatibilité RIASEC entre un élève et un tuteur.
    Score = (lettres communes / 2) * 100 → valeur 0-100.
    Ex : student='SE', tutor='SE' → 100 | student='SE', tutor='RI' → 0
    """
    if not student_code or not tutor_code:
        return 0.0
    student_dims = set(student_code.upper())
    tutor_dims   = set(tutor_code.upper())
    common       = student_dims & tutor_dims
    return round(len(common) / 2 * 100, 1)


def get_recommended_tutors(
    db: Session,
    student_id: str,
    limit: int = 10,
) -> list[TutorProfile]:
    """
    Retourne les tuteurs recommandés pour un élève.
    Critères : RIASEC compatible + matières en difficulté + zone géographique.
    Collaborative filtering activé après 3 sessions min. TODO PHASE 2.
    """
    student = db.query(StudentProfile).filter(
        StudentProfile.profile_id == student_id
    ).first()

    if not student or not student.riasec_code:
        # Fallback : tuteurs les mieux notés
        return (
            db.query(TutorProfile)
            .order_by(TutorProfile.average_rating.desc().nullslast())
            .limit(limit)
            .all()
        )

    # TODO PHASE 2 : scoring RIASEC + filtres sujets + géo
    return []


def get_tutor_compatibility(
    db: Session,
    student_id: str,
    tutor_id: str,
) -> dict:
    """Score détaillé de compatibilité entre un élève et un tuteur."""
    student = db.query(StudentProfile).filter(
        StudentProfile.profile_id == student_id
    ).first()
    tutor = db.query(TutorProfile).filter(
        TutorProfile.profile_id == tutor_id
    ).first()

    if not student or not tutor:
        return {"score": 0, "common_dims": []}

    score      = compute_riasec_score(student.riasec_code or "", tutor.riasec_code or "")
    common     = list(set(student.riasec_code or "") & set(tutor.riasec_code or ""))
    return {"score": score, "common_dims": common}
