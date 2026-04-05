"""
Service messagerie — conversations, messages, accusés de lecture.
"""

import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.models.messaging import Conversation, ConversationParticipant, Message
from src.models.notifications import MessageRead
from src.models.users import Profile


# ── Sérialisation ────────────────────────────────────────────────────────────

def _participant_name(db: Session, user_id: str, exclude_id: str) -> str:
    """Retourne le nom de l'autre participant."""
    profile = db.query(Profile).filter(
        Profile.id == user_id,
        Profile.id != exclude_id,
    ).first()
    return profile.full_name if profile else "Inconnu"


def _conv_to_dict(db: Session, conv: Conversation, current_user_id: str) -> dict:
    """Sérialise une conversation avec le dernier message et les non-lus."""
    participants = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conv.id
    ).all()

    other_id = next(
        (str(p.user_id) for p in participants if str(p.user_id) != current_user_id),
        None
    )
    other_profile = db.query(Profile).filter(Profile.id == other_id).first() if other_id else None

    last_msg = db.query(Message).filter(
        Message.conversation_id == conv.id,
        Message.is_deleted == False,
    ).order_by(Message.created_at.desc()).first()

    # Nombre de messages non lus
    unread = 0
    if last_msg:
        read_ids = {
            str(r.message_id) for r in db.query(MessageRead).filter(
                MessageRead.user_id == current_user_id
            ).all()
        }
        all_msgs = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.is_deleted == False,
            Message.sender_id != current_user_id,
        ).all()
        unread = sum(1 for m in all_msgs if str(m.id) not in read_ids)

    return {
        "id":           str(conv.id),
        "session_id":   str(conv.session_id) if conv.session_id else None,
        "other_user":   {
            "id":        str(other_profile.id)        if other_profile else None,
            "full_name": other_profile.full_name       if other_profile else "Inconnu",
            "avatar_url": other_profile.avatar_url     if other_profile else None,
        },
        "last_message": {
            "content":    last_msg.content,
            "created_at": last_msg.created_at.isoformat(),
            "is_mine":    str(last_msg.sender_id) == current_user_id,
        } if last_msg else None,
        "unread_count": unread,
        "updated_at":   conv.updated_at.isoformat() if conv.updated_at else None,
    }


def _msg_to_dict(msg: Message, current_user_id: str) -> dict:
    return {
        "id":              str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "sender_id":       str(msg.sender_id),
        "is_mine":         str(msg.sender_id) == current_user_id,
        "content":         msg.content,
        "message_type":    msg.message_type.value if hasattr(msg.message_type, "value") else msg.message_type,
        "file_url":        msg.file_url,
        "created_at":      msg.created_at.isoformat(),
    }


# ── Service ──────────────────────────────────────────────────────────────────

def list_conversations(db: Session, current_user: Profile) -> list[dict]:
    """Conversations de l'utilisateur, triées par dernier message."""
    participations = db.query(ConversationParticipant).filter(
        ConversationParticipant.user_id == current_user.id
    ).all()

    conv_ids = [p.conversation_id for p in participations]
    if not conv_ids:
        return []

    convs = db.query(Conversation).filter(
        Conversation.id.in_(conv_ids)
    ).order_by(Conversation.updated_at.desc()).all()

    return [_conv_to_dict(db, c, str(current_user.id)) for c in convs]


def get_conversation_messages(
    db: Session,
    conv_id: str,
    current_user: Profile,
    limit: int = 50,
    before: str | None = None,
) -> list[dict]:
    """Messages d'une conversation (pagination curseur)."""
    _check_participant(db, conv_id, current_user)

    q = db.query(Message).filter(
        Message.conversation_id == conv_id,
        Message.is_deleted == False,
    )
    if before:
        ref = db.query(Message).filter(Message.id == before).first()
        if ref:
            q = q.filter(Message.created_at < ref.created_at)

    msgs = q.order_by(Message.created_at.desc()).limit(limit).all()
    return [_msg_to_dict(m, str(current_user.id)) for m in reversed(msgs)]


def send_message(
    db: Session,
    conv_id: str,
    content: str,
    current_user: Profile,
    message_type: str = "text",
) -> dict:
    """Envoie un message et met à jour updated_at de la conversation."""
    _check_participant(db, conv_id, current_user)

    msg = Message(
        id=uuid.uuid4(),
        conversation_id=uuid.UUID(conv_id),
        sender_id=current_user.id,
        content=content.strip(),
        message_type=message_type,
    )
    db.add(msg)

    # Mise à jour du timestamp de la conversation
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if conv:
        from sqlalchemy.sql import func
        conv.updated_at = func.now()

    db.commit()
    db.refresh(msg)
    return _msg_to_dict(msg, str(current_user.id))


def mark_as_read(db: Session, conv_id: str, current_user: Profile) -> dict:
    """Marque tous les messages non lus comme lus."""
    _check_participant(db, conv_id, current_user)

    msgs = db.query(Message).filter(
        Message.conversation_id == conv_id,
        Message.sender_id != current_user.id,
        Message.is_deleted == False,
    ).all()

    already_read = {
        str(r.message_id) for r in db.query(MessageRead).filter(
            MessageRead.user_id == current_user.id
        ).all()
    }

    for msg in msgs:
        if str(msg.id) not in already_read:
            db.add(MessageRead(message_id=msg.id, user_id=current_user.id))

    db.commit()
    return {"marked": len([m for m in msgs if str(m.id) not in already_read])}


def get_or_create_conversation(
    db: Session,
    current_user: Profile,
    other_user_id: str,
    session_id: str | None = None,
) -> dict:
    """Retourne ou crée une conversation entre deux utilisateurs."""
    # Normalisation en UUID pour éviter les comparaisons string/UUID
    other_uuid = uuid.UUID(other_user_id)

    # Recherche d'une conversation existante commune aux deux utilisateurs
    current_convs = {
        p.conversation_id
        for p in db.query(ConversationParticipant).filter(
            ConversationParticipant.user_id == current_user.id
        ).all()
    }
    other_convs = {
        p.conversation_id
        for p in db.query(ConversationParticipant).filter(
            ConversationParticipant.user_id == other_uuid
        ).all()
    }
    common = current_convs & other_convs

    if common:
        conv_id = next(iter(common))
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if conv:
            return _conv_to_dict(db, conv, str(current_user.id))

    # Création d'une nouvelle conversation
    conv = Conversation(
        id=uuid.uuid4(),
        session_id=uuid.UUID(session_id) if session_id else None,
    )
    db.add(conv)
    db.flush()

    db.add(ConversationParticipant(
        conversation_id=conv.id, user_id=current_user.id
    ))
    db.add(ConversationParticipant(
        conversation_id=conv.id, user_id=other_uuid
    ))
    db.commit()
    db.refresh(conv)
    return _conv_to_dict(db, conv, str(current_user.id))


# ── Helper ───────────────────────────────────────────────────────────────────

def _check_participant(db: Session, conv_id: str, current_user: Profile) -> None:
    """Lève 403 si l'utilisateur n'est pas participant."""
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conv_id,
        ConversationParticipant.user_id == current_user.id,
    ).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé à cette conversation",
        )
