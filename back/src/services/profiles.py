"""
Service profils — lecture et mise à jour des profils utilisateurs et tuteurs.
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_, cast
from sqlalchemy.dialects.postgresql import ARRAY, TEXT

from src.models.users import Profile
from src.models.profiles import StudentProfile, TutorProfile


def get_full_profile(db: Session, profile: Profile) -> dict:
    """
    Retourne le profil de base + sous-profil métier selon le rôle.
    """
    data = {
        "id":                 str(profile.id),
        "email":              profile.email,
        "full_name":          profile.full_name,
        "role":               profile.role.value,
        "phone":              profile.phone,
        "avatar_url":         profile.avatar_url,
        "preferred_language": profile.preferred_language,
        "is_active":          profile.is_active,
        "created_at":         profile.created_at.isoformat() if profile.created_at else None,
        "student_profile":    None,
        "tutor_profile":      None,
    }

    if profile.role.value == "student":
        sp = db.query(StudentProfile).filter(
            StudentProfile.profile_id == profile.id
        ).first()
        if sp:
            data["student_profile"] = _student_profile_to_dict(sp)

    elif profile.role.value == "tutor":
        tp = db.query(TutorProfile).filter(
            TutorProfile.profile_id == profile.id
        ).first()
        if tp:
            data["tutor_profile"] = _tutor_profile_to_dict(tp)

    return data


def update_basic_profile(
    db: Session,
    profile: Profile,
    full_name:  str | None,
    phone:      str | None,
    avatar_url: str | None,
    locale:     str | None,
) -> Profile:
    """Met à jour les champs de base du profil."""
    if full_name  is not None: profile.full_name = full_name
    if phone      is not None: profile.phone = phone
    if avatar_url is not None: profile.avatar_url = avatar_url
    if locale     is not None and locale in ("fr", "mg"):
        profile.preferred_language = locale
    db.commit()
    db.refresh(profile)
    return profile


def search_tutors(
    db:       Session,
    subject:  str | None = None,
    location: str | None = None,
    min_rate: int | None = None,
    max_rate: int | None = None,
    limit:    int = 20,
    offset:   int = 0,
) -> list[dict]:
    """
    Recherche de tuteurs validés.
    Filtre par matière, localisation, fourchette de tarif.
    """
    query = (
        db.query(TutorProfile, Profile)
        .join(Profile, Profile.id == TutorProfile.profile_id)
        .filter(
            TutorProfile.validation_status == "validated",
            Profile.is_active.is_(True),
        )
    )

    if subject:
        # Recherche insensible à la casse dans le tableau ARRAY subjects
        # On convertit le tableau en texte pour utiliser ILIKE
        query = query.filter(
            cast(TutorProfile.subjects, TEXT).ilike(f"%{subject}%")
        )
    if location:
        query = query.filter(
            TutorProfile.location.ilike(f"%{location}%")
        )
    if min_rate is not None:
        query = query.filter(TutorProfile.hourly_rate >= min_rate)
    if max_rate is not None:
        query = query.filter(TutorProfile.hourly_rate <= max_rate)

    rows = query.order_by(
        TutorProfile.avg_rating.desc(),
        TutorProfile.total_sessions.desc(),
    ).offset(offset).limit(limit).all()

    return [_tutor_public_dict(tp, p) for tp, p in rows]


def get_tutor_public_profile(db: Session, tutor_id: str) -> dict | None:
    """Profil public d'un tuteur validé."""
    row = (
        db.query(TutorProfile, Profile)
        .join(Profile, Profile.id == TutorProfile.profile_id)
        .filter(
            Profile.id == tutor_id,
            TutorProfile.validation_status == "validated",
            Profile.is_active.is_(True),
        )
        .first()
    )
    if not row:
        return None
    tp, p = row
    return _tutor_public_dict(tp, p)


# ── Helpers de sérialisation ──────────────────────────────────────────────────

def _student_profile_to_dict(sp: StudentProfile) -> dict:
    return {
        "id":              str(sp.id),
        "grade_level":     sp.grade_level,
        "school_name":     sp.school_name,
        "serie":           sp.serie,
        "subjects_needed": sp.subjects_needed or [],
        "location":        sp.location,
        "vak_dominant":    sp.vak_dominant,
        "riasec_code":     sp.riasec_code,
        "disc_profile":    sp.disc_profile,
    }


def _tutor_profile_to_dict(tp: TutorProfile) -> dict:
    return {
        "id":                str(tp.id),
        "validation_status": tp.validation_status.value,
        "bio":               tp.bio,
        "subjects":          tp.subjects or [],
        "grade_levels":      tp.grade_levels or [],
        "hourly_rate":       tp.hourly_rate,
        "teaching_methods":  tp.teaching_methods or [],
        "location":          tp.location,
        "avg_rating":        float(tp.avg_rating or 0),
        "total_sessions":    tp.total_sessions or 0,
        "canope_certified":  tp.canope_certified,
        "kyc_verified":      tp.kyc_verified,
        "wallet_balance":    tp.wallet_balance or 0,
        "slug":              tp.slug,
    }


def update_tutor_profile(
    db:       Session,
    profile:  Profile,
    bio:              str | None       = None,
    subjects:         list[str] | None = None,
    grade_levels:     list[str] | None = None,
    hourly_rate:      int | None       = None,
    teaching_methods: list[str] | None = None,
    location:         str | None       = None,
) -> dict:
    """
    Met à jour le sous-profil tuteur.
    Lève 404 si le TutorProfile n'existe pas encore pour ce profil.
    """
    from fastapi import HTTPException, status as http_status
    tp = db.query(TutorProfile).filter(TutorProfile.profile_id == profile.id).first()
    if not tp:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Profil tuteur introuvable",
        )
    if bio              is not None: tp.bio              = bio
    if subjects         is not None: tp.subjects         = subjects
    if grade_levels     is not None: tp.grade_levels     = grade_levels
    if hourly_rate      is not None: tp.hourly_rate      = hourly_rate
    if teaching_methods is not None: tp.teaching_methods = teaching_methods
    if location         is not None: tp.location         = location
    db.commit()
    db.refresh(tp)
    return get_full_profile(db, profile)


def _tutor_public_dict(tp: TutorProfile, p: Profile) -> dict:
    """Version publique du profil tuteur (sans wallet)."""
    return {
        "id":               str(p.id),
        "full_name":        p.full_name,
        "avatar_url":       p.avatar_url,
        "slug":             tp.slug,
        "bio":              tp.bio,
        "subjects":         tp.subjects or [],
        "grade_levels":     tp.grade_levels or [],
        "hourly_rate":      tp.hourly_rate,
        "teaching_methods": tp.teaching_methods or [],
        "location":         tp.location,
        "avg_rating":       float(tp.avg_rating or 0),
        "total_sessions":   tp.total_sessions or 0,
        "canope_certified": tp.canope_certified,
    }
