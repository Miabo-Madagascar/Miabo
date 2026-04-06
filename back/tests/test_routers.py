"""
Tests d'intégration — routers FastAPI.
Utilise TestClient avec dépendances remplacées (mock_db + utilisateur injecté).
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest

from src.models.enums import UserRole
from src.models.messaging import ConversationParticipant, Message
from src.models.notifications import MessageRead
from tests.conftest import make_profile


# ── /health ────────────────────────────────────────────────────────────────

def test_health_check(app_client):
    res = app_client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


# ── Routes protégées sans auth ─────────────────────────────────────────────

def test_list_conversations_sans_token(app_client_no_auth):
    """Sans header Authorization → 403 (HTTPBearer rejette)."""
    res = app_client_no_auth.get("/api/v1/messages/conversations")
    assert res.status_code in (401, 403)


def test_sessions_sans_token(app_client_no_auth):
    res = app_client_no_auth.get("/api/v1/sessions/")
    assert res.status_code in (401, 403)


# ── GET /messages/conversations ────────────────────────────────────────────

def test_list_conversations_vide(app_client, mock_db):
    """Utilisateur sans conversations → liste vide."""
    mock_db.query.return_value.filter.return_value.all.return_value = []

    res = app_client.get("/api/v1/messages/conversations")
    assert res.status_code == 200
    assert res.json() == []


# ── POST /messages/ ────────────────────────────────────────────────────────

def test_send_message_endpoint(app_client, mock_db):
    """Envoi d'un message via l'endpoint → 201 + données du message."""
    conv_id = str(uuid.uuid4())

    # Participant vérifié
    mock_db.query.return_value.filter.return_value.first.return_value = MagicMock()

    payload = {"conversation_id": conv_id, "content": "Bonjour test"}

    with patch("src.routers.messages.sse_manager.publish"):
        res = app_client.post("/api/v1/messages/", json=payload)

    assert res.status_code == 201
    data = res.json()
    assert data["content"] == "Bonjour test"
    assert data["is_mine"] is True


def test_send_message_contenu_vide(app_client, mock_db):
    """Contenu vide → 422 (validation Pydantic)."""
    payload = {"conversation_id": str(uuid.uuid4()), "content": "   "}
    res = app_client.post("/api/v1/messages/", json=payload)
    assert res.status_code == 422


# ── POST /messages/conversations ───────────────────────────────────────────

def test_create_conversation_endpoint(app_client, mock_db):
    """Création d'une conversation → 201 + ID."""
    from src.models.messaging import Conversation, ConversationParticipant

    other_id = str(uuid.uuid4())

    # Aucune conversation commune existante
    mock_db.query.return_value.filter.return_value.all.return_value = []

    conv_mock = MagicMock(id=uuid.uuid4(), session_id=None, updated_at=None)
    mock_db.refresh.side_effect = lambda obj: None

    with patch("src.services.messages.Conversation", return_value=conv_mock), \
         patch("src.services.messages._conv_to_dict", return_value={
             "id": str(conv_mock.id), "other_user": {"id": other_id, "full_name": "X", "avatar_url": None},
             "last_message": None, "unread_count": 0, "session_id": None, "updated_at": None,
         }):
        res = app_client.post("/api/v1/messages/conversations", json={"other_user_id": other_id})

    assert res.status_code == 201
    assert "id" in res.json()


# ── GET /sessions/ ─────────────────────────────────────────────────────────

def test_list_sessions_vide(app_client, mock_db):
    """Utilisateur sans sessions → liste vide."""
    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []

    res = app_client.get("/api/v1/sessions/")
    assert res.status_code == 200
    assert res.json() == []
