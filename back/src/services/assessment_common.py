"""
Helpers partagés bilans d'orientation — calcul des scores et sérialisation.
Utilisés par les services CANOPE/COSP (assessments.py) et auto-bilan élève
(self_assessments.py).
"""

from sqlalchemy.orm import Session as DbSession

from src.models.canope import Assessment
from src.models.canope_users import ExternalYoungProfile
from src.models.profiles import StudentProfile
from src.models.users import Profile


# ── Calcul des profils dominants ────────────────────────────────────────────

def vak_dominant(v: int, a: int, k: int) -> str:
    """Lettre dominante = score brut le plus élevé parmi V, A, K."""
    return max(zip([v, a, k], ["V", "A", "K"]), key=lambda x: x[0])[1]


def riasec_code(scores: dict) -> str:
    """Code de Holland : 3 lettres = les 3 dimensions RIASEC avec les scores les plus hauts."""
    top3 = sorted(scores, key=scores.get, reverse=True)[:3]
    return "".join(top3)


def disc_dominant(scores: dict) -> str:
    """Code DISC = profils dont le score atteint ≥ 40 % du score dominant.
    Donne 1 à 4 lettres selon les ex-aequo (ex : 'DI', 'DIS').
    Seuil 40 % aligné avec DiscResults côté front."""
    top_score = max(scores.values(), default=0) or 1
    threshold = top_score * 0.4
    dominants = sorted(
        [k for k, v in scores.items() if v >= threshold],
        key=lambda k: scores[k], reverse=True,
    )
    return "".join(dominants) or max(scores, key=scores.get)


# ── Sérialisation ────────────────────────────────────────────────────────────

def assessment_to_dict(a: Assessment, db: DbSession | None = None) -> dict:
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

    # Résolution du nom de l'élève MIABO (Option A) via son profil utilisateur
    student_name: str | None = None
    if a.student_profile_id and db:
        student_name = (
            db.query(Profile.full_name)
            .join(StudentProfile, StudentProfile.profile_id == Profile.id)
            .filter(StudentProfile.id == a.student_profile_id)
            .scalar()
        )

    return {
        "id":                          str(a.id),
        "administered_by":             str(a.administered_by) if a.administered_by else None,
        "student_profile_id":          str(a.student_profile_id) if a.student_profile_id else None,
        "student_full_name":           student_name,
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
