"""
Schémas Pydantic — Auth et profils utilisateurs.
"""

from pydantic import BaseModel, EmailStr, field_validator
from src.models.enums import UserRole


class RegisterRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str
    role:      UserRole
    phone:     str | None = None
    locale:    str = "fr"

    @field_validator("role")
    @classmethod
    def role_must_be_registrable(cls, v: UserRole) -> UserRole:
        allowed = {UserRole.student, UserRole.tutor, UserRole.parent}
        if v not in allowed:
            raise ValueError("Rôle non autorisé à l'inscription")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str | None) -> str | None:
        import re
        if v and not re.match(r"^\+261[0-9]{9}$", v):
            raise ValueError("Format téléphone invalide (+261XXXXXXXXX)")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    token_type:    str = "bearer"
    expires_in:    int


class UpdateProfileRequest(BaseModel):
    full_name:   str | None = None
    phone:       str | None = None
    avatar_url:  str | None = None
    locale:      str | None = None
