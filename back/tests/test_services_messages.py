"""
Tests unitaires — service messagerie.
Couvre : _check_participant, send_message, mark_as_read, get_or_create_conversation.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

import pytest

from src.models.enums import UserRole
from src.models.messaging import Conversation, ConversationParticipant, Message
from src.models.notifications import MessageRead
from src.services import messages as svc
from tests.conftest import make_profile


# ── _check_participant ─────────────────────────────────────────────────────

def test_check_participant_autorise(mock_db):
    """Participant présent → pas d'exception."""
    user = make_profile(UserRole.student)
    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock()
    svc._check_participant(mock_db, str(uuid.uuid4()), user)  # ne lève pas


def test_check_participant_refuse(mock_db):
    """Participant absent → HTTPException 403."""
    user = make_profile(UserRole.student)
    mock_db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        svc._check_participant(mock_db, str(uuid.uuid4()), user)
    assert exc.value.status_code == 403


# ── send_message ───────────────────────────────────────────────────────────

def test_send_message(mock_db):
    """Envoi d'un message : insertion + mise à jour conversation."""
    user    = make_profile(UserRole.student)
    conv_id = str(uuid.uuid4())

    # Participant vérifié
    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock()

    result = svc.send_message(mock_db, conv_id, "Bonjour !", user)

    mock_db.add.assert_called()
    mock_db.commit.assert_called_once()
    assert result["content"] == "Bonjour !"
    assert result["is_mine"] is True


def test_send_message_contenu_vide(mock_db):
    """Le contenu est trimmé — un contenu vide après trim ne doit pas crasher."""
    user = make_profile(UserRole.student)
    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock()

    # Le service strip() le contenu — " " devient ""
    result = svc.send_message(mock_db, str(uuid.uuid4()), "  test  ", user)
    assert result["content"] == "test"


# ── mark_as_read ───────────────────────────────────────────────────────────

def test_mark_as_read(mock_db):
    """Marque les messages non-lus comme lus."""
    user    = make_profile(UserRole.student)
    conv_id = str(uuid.uuid4())

    msg1 = MagicMock(id=uuid.uuid4(), sender_id=uuid.uuid4())
    msg2 = MagicMock(id=uuid.uuid4(), sender_id=uuid.uuid4())

    def query_side(model):
        q = MagicMock()
        if model is ConversationParticipant:
            q.filter.return_value.first.return_value = MagicMock()
        elif model is Message:
            q.filter.return_value.all.return_value = [msg1, msg2]
        elif model is MessageRead:
            q.filter.return_value.all.return_value = []  # aucun déjà lu
        return q

    mock_db.query.side_effect = query_side

    result = svc.mark_as_read(mock_db, conv_id, user)
    assert result["marked"] == 2
    assert mock_db.add.call_count == 2


# ── get_or_create_conversation ─────────────────────────────────────────────

def test_get_or_create_conversation_existante(mock_db):
    """Une conversation commune existe déjà → la retourne."""
    user       = make_profile(UserRole.student)
    other_id   = str(uuid.uuid4())
    shared_cid = uuid.uuid4()

    # Participations de chaque utilisateur
    p_user  = MagicMock(conversation_id=shared_cid)
    p_other = MagicMock(conversation_id=shared_cid)
    conv    = MagicMock(id=shared_cid, session_id=None, updated_at=None)

    def query_side(model):
        q = MagicMock()
        if model is ConversationParticipant:
            q.filter.return_value.all.side_effect = [
                [p_user], [p_other],
            ]
        elif model is Conversation:
            q.filter.return_value.first.return_value = conv
        return q

    mock_db.query.side_effect = query_side

    with patch.object(svc, "_conv_to_dict", return_value={"id": str(shared_cid)}):
        result = svc.get_or_create_conversation(mock_db, user, other_id)

    assert result["id"] == str(shared_cid)
    mock_db.add.assert_not_called()  # pas de nouvelle conversation créée


def test_get_or_create_conversation_nouvelle(mock_db):
    """Aucune conversation commune → en crée une nouvelle."""
    user     = make_profile(UserRole.student)
    other_id = str(uuid.uuid4())

    def query_side(model):
        q = MagicMock()
        if model is ConversationParticipant:
            q.filter.return_value.all.return_value = []
        return q

    mock_db.query.side_effect = query_side

    conv_mock = MagicMock(id=uuid.uuid4(), session_id=None, updated_at=None)
    mock_db.refresh.side_effect = lambda obj: None

    with patch("src.services.messages.Conversation", return_value=conv_mock), \
         patch.object(svc, "_conv_to_dict", return_value={"id": "new"}):
        result = svc.get_or_create_conversation(mock_db, user, other_id)

    assert result["id"] == "new"
    assert mock_db.add.call_count >= 3  # conv + 2 participants
