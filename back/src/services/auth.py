"""
Service auth — création et récupération de profils utilisateurs.
Appelé uniquement par src/routers/auth.py et src/dependencies.py.
"""

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.users import Profile
from src.models.profiles import StudentProfile, TutorProfile
from src.models.canope_users import CanopProfile
from src.models.enums import UserRole


def get_profile_by_id(db: Session, user_id: str) -> Profile | None:
    """Retourne le profil par UUID Supabase. None si inexistant."""
    return db.query(Profile).filter(Profile.id == user_id).first()


def get_profile_by_email(db: Session, email: str) -> Profile | None:
    """Retourne le profil par email. None si inexistant."""
    return db.query(Profile).filter(Profile.email == email).first()


def create_profile(
    db:        Session,
    user_id:   str,
    email:     str,
    full_name: str,
    role:      UserRole,
    phone:     str | None = None,
    locale:    str = "fr",
) -> Profile:
    """
    Crée la ligne profiles après que Supabase Auth a créé l'utilisateur.
    Lève 409 si le profil existe déjà (double appel à /register).
    """
    existant = get_profile_by_id(db, user_id)
    if existant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profil déjà existant pour cet utilisateur",
        )

    profile = Profile(
        id=uuid.UUID(user_id),
        email=email,
        full_name=full_name,
        role=role,
        phone=phone,
        preferred_language=locale if locale in ("fr", "mg") else "fr",
        is_active=True,
    )
    db.add(profile)
    db.flush()  # obtenir l'id avant de créer le sous-profil

    # Crée le sous-profil métier selon le rôle
    if role == UserRole.student:
        db.add(StudentProfile(
            id=uuid.uuid4(),
            profile_id=profile.id,
            grade_level="6eme",       # valeur par défaut — modifiable dans le profil
            subjects_needed=[],
        ))
    elif role == UserRole.tutor:
        db.add(TutorProfile(
            id=uuid.uuid4(),
            profile_id=profile.id,
            hourly_rate=5000,         # valeur par défaut — modifiable dans le profil
            subjects=[],
            grade_levels=[],
            teaching_methods=[],
        ))
    elif role in (UserRole.canope, UserRole.cosp):
        # Création du profil partenaire avec données par défaut (à compléter)
        parts = full_name.split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else "-"
        
        prefix = "CANOPE" if role == UserRole.canope else "COSP"
        sesame = f"{prefix}-{str(uuid.uuid4())[:8].upper()}"

        from datetime import date
        db.add(CanopProfile(
            id=uuid.uuid4(),
            profile_id=profile.id,
            sesame_code=sesame,
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date(1990, 1, 1), # Valeur par défaut
            gender="autre",
            city="Antananarivo",
            region="Analamanga",
            phone=phone or "-",
            profession="Agent",
            is_cosp=(role == UserRole.cosp)
        ))

    db.commit()
    db.refresh(profile)
    return profile


def profile_to_dict(profile: Profile) -> dict:
    """Sérialise un Profile SQLAlchemy en dict JSON-compatible."""
    return {
        "id":                 str(profile.id),
        "email":              profile.email,
        "full_name":          profile.full_name,
        "role":               profile.role.value,
        "phone":              profile.phone,
        "avatar_url":         profile.avatar_url,
        "preferred_language": profile.preferred_language,
        "is_active":          profile.is_active,
        "created_at":         profile.created_at.isoformat() if profile.created_at else None,
    }
