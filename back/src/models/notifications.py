"""
Modèles SQLAlchemy — accusés de lecture, réactions, notifications.
Tables : message_reads, message_reactions, notifications
"""

import uuid
from sqlalchemy import (Boolean, CheckConstraint, Column, Enum,
                         Text, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base
from .enums import NotificationType


class MessageRead(Base):
    """
    Accusés de lecture multi-utilisateurs.
    Correction v1 : remplace le booléen messages.read (mono-user).
    Clé primaire composite (message_id, user_id).
    """
    __tablename__ = "message_reads"

    message_id = Column(UUID(as_uuid=True),
                        ForeignKey("messages.id", ondelete="CASCADE"),
                        primary_key=True)
    user_id    = Column(UUID(as_uuid=True),
                        ForeignKey("profiles.id", ondelete="CASCADE"),
                        primary_key=True)
    read_at    = Column(TIMESTAMP(timezone=True), server_default=func.now())


class MessageReaction(Base):
    """
    Réactions emoji — 6 types autorisés (CDC §MSG).
    Clé primaire composite (message_id, user_id, emoji)
    pour garantir l'unicité de chaque réaction.
    """
    __tablename__ = "message_reactions"

    message_id = Column(UUID(as_uuid=True),
                        ForeignKey("messages.id", ondelete="CASCADE"),
                        primary_key=True)
    user_id    = Column(UUID(as_uuid=True),
                        ForeignKey("profiles.id", ondelete="CASCADE"),
                        primary_key=True)
    emoji      = Column(Text, primary_key=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "emoji IN ('👍', '❤️', '😊', '✅', '😮', '😢')",
            name="chk_allowed_emojis"
        ),
    )


class Notification(Base):
    """
    Notifications in-app — diffusées via Supabase Realtime.
    Conservation 30 jours (nettoyage par APScheduler).
    Le champ link contient une URL relative (ex: /dashboard/sessions/uuid).
    """
    __tablename__ = "notifications"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True),
                        ForeignKey("profiles.id", ondelete="CASCADE"),
                        nullable=False, index=True)
    type       = Column(Enum(NotificationType, name="notification_type"),
                        nullable=False)
    title      = Column(Text, nullable=False)
    body       = Column(Text)
    link       = Column(Text)
    is_read    = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("char_length(title) <= 100", name="chk_notif_title_length"),
    )
