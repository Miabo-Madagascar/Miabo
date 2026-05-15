"""
Service profils — lecture et mise à jour des profils utilisateurs et tuteurs.
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_, cast
from sqlalchemy.dialects.postgresql import ARRAY, TEXT

from src.models.users import Profile
from src.models.profiles import StudentProfile, TutorProfile
from src.models.canope_users import CanopProfile


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
        "canop_profile":      None,
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

    elif profile.role.value in ("canope", "cosp"):
        cp = db.query(CanopProfile).filter(
            CanopProfile.profile_id == profile.id
        ).first()
        if cp:
            data["canop_profile"] = _canop_profile_to_dict(cp)

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


def list_students(db: Session) -> list[dict]:
    """Liste tous les élèves inscrits avec leurs infos de base."""
    rows = (
        db.query(StudentProfile, Profile)
        .join(Profile, Profile.id == StudentProfile.profile_id)
        .filter(Profile.is_active.is_(True))
        .all()
    )
    return [
        {
            "profile_id": str(p.id),
            "student_profile_id": str(sp.id),
            "full_name": p.full_name,
            "grade_level": sp.grade_level,
        }
        for sp, p in rows
    ]


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


def _canop_profile_to_dict(cp: CanopProfile) -> dict:
    return {
        "id":                  str(cp.id),
        "sesame_code":         cp.sesame_code,
        "first_name":          cp.first_name,
        "last_name":           cp.last_name,
        "date_of_birth":       cp.date_of_birth.isoformat() if cp.date_of_birth else None,
        "gender":              cp.gender,
        "address":             cp.address,
        "city":                cp.city,
        "region":              cp.region,
        "phone":               cp.phone,
        "profession":          cp.profession,
        "profile_type":        cp.profile_type,
        "profile_other":       cp.profile_other,
        "education_level":     cp.education_level,
        "cosp_training_dates": [d.isoformat() for d in (cp.cosp_training_dates or [])],
        "is_cosp":             cp.is_cosp,
    }


def update_canope_profile(
    db:      Session,
    profile: Profile,
    data:    "UpdateCanopProfileRequest",
) -> dict:
    """Met à jour le sous-profil CANOPE/COSP."""
    from fastapi import HTTPException, status as http_status
    from src.schemas.auth import UpdateCanopProfileRequest
    from datetime import date

    cp = db.query(CanopProfile).filter(CanopProfile.profile_id == profile.id).first()
    if not cp:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Profil CANOPE/COSP introuvable",
        )

    if data.first_name      is not None: cp.first_name      = data.first_name
    if data.last_name       is not None: cp.last_name       = data.last_name
    if data.date_of_birth   is not None:
        cp.date_of_birth = date.fromisoformat(data.date_of_birth)
    if data.gender          is not None: cp.gender          = data.gender
    if data.address         is not None: cp.address         = data.address
    if data.city            is not None: cp.city            = data.city
    if data.region          is not None: cp.region          = data.region
    if data.profession      is not None: cp.profession      = data.profession
    if data.profile_type    is not None: cp.profile_type    = data.profile_type
    if data.profile_other   is not None: cp.profile_other   = data.profile_other
    if data.education_level is not None: cp.education_level = data.education_level
    if data.cosp_training_dates is not None and cp.is_cosp:
        cp.cosp_training_dates = [date.fromisoformat(d) for d in data.cosp_training_dates]

    db.commit()
    db.refresh(cp)
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
