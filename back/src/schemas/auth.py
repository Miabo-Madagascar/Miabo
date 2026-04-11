"""
Schémas Pydantic — Auth et profils utilisateurs.
"""

import re
from pydantic import BaseModel, EmailStr, field_validator
from src.models.enums import UserRole

REGISTRABLE_ROLES = {UserRole.student, UserRole.tutor, UserRole.parent}


class RegisterRequest(BaseModel):
    """
    Payload POST /api/v1/auth/register.
    Le `token` est le JWT Supabase retourné par signUp() côté front.
    Il contient le sub (UUID) et l'email — FastAPI les extrait pour créer le profil.
    """
    token:     str         # JWT Supabase (contient sub + email)
    full_name: str
    role:      UserRole
    email:     EmailStr | None = None   # fallback si absent du JWT
    phone:     str | None = None
    locale:    str = "fr"

    @field_validator("role")
    @classmethod
    def role_must_be_registrable(cls, v: UserRole) -> UserRole:
        if v not in REGISTRABLE_ROLES:
            raise ValueError("Rôle non autorisé à l'inscription")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str | None) -> str | None:
        if v and not re.match(r"^\+261[0-9]{9}$", v):
            raise ValueError("Format téléphone invalide (+261XXXXXXXXX)")
        return v


class UpdateProfileRequest(BaseModel):
    full_name:  str | None = None
    phone:      str | None = None
    avatar_url: str | None = None
    locale:     str | None = None


class UpdateTutorProfileRequest(BaseModel):
    """Mise à jour du sous-profil tuteur — tous les champs sont optionnels."""
    bio:              str | None       = None
    subjects:         list[str] | None = None
    grade_levels:     list[str] | None = None
    hourly_rate:      int | None       = None
    teaching_methods: list[str] | None = None
    location:         str | None       = None


class ProfileResponse(BaseModel):
    id:                 str
    email:              str
    full_name:          str
    role:               str
    phone:              str | None
    avatar_url:         str | None
    preferred_language: str
    is_active:          bool
    created_at:         str | None
