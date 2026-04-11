"""
Modèles SQLAlchemy — domaine Auth & Utilisateurs (tables hub).
Tables : profiles, parent_student_links
"""

import uuid
from sqlalchemy import Boolean, Column, Enum, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base
from .enums import UserRole


class Profile(Base):
    """
    Table centrale des utilisateurs — liée à auth.users Supabase.
    L'id est fourni par Supabase Auth, jamais généré ici.
    """
    __tablename__ = "profiles"

    # Clé primaire = id Supabase Auth (géré par Supabase)
    id                 = Column(UUID(as_uuid=True), primary_key=True)
    role               = Column(Enum(UserRole, name="user_role"), nullable=False)
    full_name          = Column(Text, nullable=False)
    email              = Column(Text, nullable=False, unique=True)
    phone              = Column(Text)
    avatar_url         = Column(Text)
    preferred_language = Column(String(2), nullable=False, server_default="fr")
    is_active          = Column(Boolean, nullable=False, server_default="true")
    created_at         = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at         = Column(TIMESTAMP(timezone=True), server_default=func.now(),
                                onupdate=func.now())

    __table_args__ = (
        CheckConstraint("preferred_language IN ('fr', 'mg')",
                        name="chk_preferred_language"),
        CheckConstraint("phone ~ '^\\+261[0-9]{9}$'",
                        name="chk_phone_format"),
    )


class ParentStudentLink(Base):
    """
    Lien parent ↔ enfant — clé primaire composite.
    Vérifié par email avant activation (CDC §AUTH-005).
    """
    __tablename__ = "parent_student_links"

    parent_id    = Column(UUID(as_uuid=True),
                          ForeignKey("profiles.id", ondelete="CASCADE"),
                          primary_key=True)
    student_id   = Column(UUID(as_uuid=True),
                          ForeignKey("profiles.id", ondelete="CASCADE"),
                          primary_key=True)
    relationship = Column(Text, nullable=False, server_default="parent")
    verified     = Column(Boolean, nullable=False, server_default="false")
    created_at   = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "relationship IN ('parent', 'tuteur_legal', 'autre')",
            name="chk_relationship_type"
        ),
    )
