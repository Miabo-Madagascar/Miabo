"""
Service bilans d'orientation — VAK, RIASEC, DISC.
Administrés par les acteurs CANOPE/COSP via leurs canope_profiles.
"""

import uuid
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.canope import Assessment
from src.models.canope_users import CanopProfile, ExternalYoungProfile
from src.models.users import Profile
from src.models.enums import AssessmentStatus
from src.schemas.assessments import (
    CreateAssessmentRequest, VakRequest, RiasecRequest,
    DiscRequest, ValidateAssessmentRequest,
)


# ── Helpers calcul ────────────────────────────────────────────────────────────

def _vak_dominant(v: int, a: int, k: int) -> str:
    """Lettre dominante = score brut le plus élevé parmi V, A, K."""
    return max(zip([v, a, k], ["V", "A", "K"]), key=lambda x: x[0])[1]


def _riasec_code(scores: dict) -> str:
    """Code 2 lettres = les 2 dimensions RIASEC avec les scores les plus hauts."""
    top2 = sorted(scores, key=scores.get, reverse=True)[:2]
    return "".join(top2)


def _disc_dominant(scores: dict) -> str:
    """Profil dominant DISC = dimension avec le score le plus élevé."""
    return max(scores, key=scores.get)


# ── Helpers BDD ───────────────────────────────────────────────────────────────

def _get_canope_profile(db: DbSession, user: Profile) -> CanopProfile:
    cp = db.query(CanopProfile).filter(CanopProfile.profile_id == user.id).first()
    if not cp:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Profil CANOPE/COSP introuvable")
    return cp


def _get_assessment(db: DbSession, assessment_id: str, cp: CanopProfile) -> Assessment:
    a = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.administered_by == cp.id,
    ).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bilan introuvable")
    return a


def _to_dict(a: Assessment, db: DbSession | None = None) -> dict:
    # Résolution des infos du jeune externe via la table external_young_profiles
    ey_name: str | None = None
    ey_dob:  str | None = None
    ey_gender:  str | None = None
    ey_region:  str | None = None
    ey_quartier: str | None = None
    ey_school:  str | None = None
    if a.external_young_id and db:
        ey = db.query(ExternalYoungProfile).filter(
            ExternalYoungProfile.id == a.external_young_id
        ).first()
        if ey:
            ey_name    = ey.full_name
            ey_dob     = ey.date_of_birth.isoformat() if ey.date_of_birth else None
            ey_gender  = ey.gender
            ey_region  = ey.region
            ey_quartier = ey.quartier
            ey_school  = ey.school_name

    return {
        "id":                          str(a.id),
        "administered_by":             str(a.administered_by),
        "student_profile_id":          str(a.student_profile_id) if a.student_profile_id else None,
        "external_young_id":           str(a.external_young_id)  if a.external_young_id  else None,
        "external_young_full_name":    ey_name,
        "external_young_date_of_birth": ey_dob,
        "external_young_gender":       ey_gender,
        "external_young_region":       ey_region,
        "external_young_quartier":     ey_quartier,
        "external_young_school_name":  ey_school,
        "serie":                    a.serie,
        "career_interest":          a.career_interest,
        "vak_v_score":              a.vak_v_score,
        "vak_a_score":              a.vak_a_score,
        "vak_k_score":              a.vak_k_score,
        "vak_dominant":             a.vak_dominant,
        "riasec_scores":            a.riasec_scores,
        "riasec_code":              a.riasec_code,
        "disc_scores":              a.disc_scores,
        "disc_dominant":            a.disc_dominant,
        "actor_comment":            a.actor_comment,
        "status":                   a.status.value,
        "created_at":               a.created_at.isoformat() if a.created_at else None,
        "validated_at":             a.validated_at.isoformat() if a.validated_at else None,
    }


# ── Service ───────────────────────────────────────────────────────────────────

def list_assessments(db: DbSession, user: Profile) -> list[dict]:
    """Bilans administrés par l'acteur connecté, du plus récent au plus ancien."""
    cp   = _get_canope_profile(db, user)
    rows = db.query(Assessment).filter(
        Assessment.administered_by == cp.id
    ).order_by(Assessment.created_at.desc()).all()
    return [_to_dict(a, db) for a in rows]


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
        
    cp = _get_canope_profile(db, user)
    
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
    return _to_dict(a, db)


def submit_vak(db: DbSession, assessment_id: str, user: Profile, data: VakRequest) -> dict:
    """Enregistre les scores VAK et calcule le profil dominant."""
    cp = _get_canope_profile(db, user)
    a  = _get_assessment(db, assessment_id, cp)
    a.vak_v_score  = data.v_score
    a.vak_a_score  = data.a_score
    a.vak_k_score  = data.k_score
    a.vak_dominant = _vak_dominant(data.v_score, data.a_score, data.k_score)
    a.status       = AssessmentStatus.in_progress
    db.commit()
    db.refresh(a)
    return _to_dict(a, db)


def submit_riasec(db: DbSession, assessment_id: str, user: Profile, data: RiasecRequest) -> dict:
    """Enregistre les scores RIASEC et calcule le code 2 lettres."""
    cp     = _get_canope_profile(db, user)
    a      = _get_assessment(db, assessment_id, cp)
    scores = {"R": data.R, "I": data.I, "A": data.A, "S": data.S, "E": data.E, "C": data.C}
    a.riasec_scores = scores
    a.riasec_code   = _riasec_code(scores)
    db.commit()
    db.refresh(a)
    return _to_dict(a, db)


def submit_disc(db: DbSession, assessment_id: str, user: Profile, data: DiscRequest) -> dict:
    """Enregistre les scores DISC et calcule le profil dominant."""
    cp     = _get_canope_profile(db, user)
    a      = _get_assessment(db, assessment_id, cp)
    scores = {"D": data.D, "I": data.I, "S": data.S, "C": data.C}
    a.disc_scores   = scores
    a.disc_dominant = _disc_dominant(scores)
    db.commit()
    db.refresh(a)
    return _to_dict(a, db)


def validate_assessment(
    db: DbSession, assessment_id: str, user: Profile, data: ValidateAssessmentRequest,
) -> dict:
    """Valide le bilan — le rend immuable (sauf Admin). Requiert VAK + RIASEC + DISC."""
    from datetime import datetime, timezone
    cp = _get_canope_profile(db, user)
    a  = _get_assessment(db, assessment_id, cp)
    if not (a.vak_dominant and a.riasec_code and a.disc_dominant):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Les 3 tests (VAK, RIASEC, DISC) doivent être complétés avant validation.",
        )
    a.actor_comment = data.actor_comment
    a.status        = AssessmentStatus.validated
    a.validated_at  = datetime.now(timezone.utc)
    db.commit()
    db.refresh(a)
    return _to_dict(a, db)


def get_assessment(db: DbSession, assessment_id: str, user: Profile) -> dict:
    """Retourne un bilan par son ID (acteur propriétaire uniquement)."""
    cp = _get_canope_profile(db, user)
    return _to_dict(_get_assessment(db, assessment_id, cp), db)


def get_assessment_stats(db: DbSession, user: Profile) -> dict:
    """Statistiques agrégées des bilans pour le dashboard CANOPE/COSP."""
    from datetime import datetime, timezone

    cp  = _get_canope_profile(db, user)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Base filtrée sur l'acteur courant — chaque .filter() crée une nouvelle requête
    q           = db.query(Assessment).filter(Assessment.administered_by == cp.id)
    total       = q.count()
    draft       = q.filter(Assessment.status == AssessmentStatus.draft).count()
    in_progress = q.filter(Assessment.status == AssessmentStatus.in_progress).count()
    validated   = q.filter(Assessment.status == AssessmentStatus.validated).count()
    this_month  = q.filter(Assessment.created_at >= month_start).count()

    return {
        "total":           total,
        "draft":           draft,
        "in_progress":     in_progress,
        "validated":       validated,
        "this_month":      this_month,
        "completion_rate": round(validated / total * 100) if total > 0 else 0,
    }
