"""
Modèles SQLAlchemy — domaine Messagerie.
Tables : conversations, conversation_participants, messages
"""

import uuid
from sqlalchemy import (Boolean, CheckConstraint, Column, Enum,
                         Text, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

from src.config.database import Base
from .enums import ConversationType, MessageType


class Conversation(Base):
    """
    Fil de discussion entre deux utilisateurs.
    updated_at est mis à jour par trigger à chaque nouveau message.
    """
    __tablename__ = "conversations"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type       = Column(Enum(ConversationType, name="conversation_type"),
                        nullable=False, server_default="student_tutor")
    session_id = Column(UUID(as_uuid=True),
                        ForeignKey("sessions.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(),
                        onupdate=func.now())


class ConversationParticipant(Base):
    """
    Participants d'une conversation (table de liaison N-N).
    Utilisé par les politiques RLS pour valider les droits de lecture/écriture.
    """
    __tablename__ = "conversation_participants"

    conversation_id = Column(UUID(as_uuid=True),
                             ForeignKey("conversations.id", ondelete="CASCADE"),
                             primary_key=True)
    user_id         = Column(UUID(as_uuid=True),
                             ForeignKey("profiles.id", ondelete="CASCADE"),
                             primary_key=True)
    joined_at       = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Message(Base):
    """
    Message individuel — soft delete (is_deleted).
    Les fichiers sont stockés sur Supabase Storage (file_url).
    """
    __tablename__ = "messages"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True),
                             ForeignKey("conversations.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    # Référence auth.users (Supabase Auth) — pas profiles
    sender_id       = Column(UUID(as_uuid=True), nullable=False)
    content         = Column(Text, nullable=False)
    message_type    = Column(Enum(MessageType, name="message_type"),
                             nullable=False, server_default="text")
    file_url        = Column(Text)
    is_deleted      = Column(Boolean, nullable=False, server_default="false")
    created_at      = Column(TIMESTAMP(timezone=True), server_default=func.now(),
                             index=True)

    __table_args__ = (
        CheckConstraint("char_length(content) > 0", name="chk_content_not_empty"),
    )
