"""
Tests d'intégration — routers FastAPI.
Utilise TestClient avec dépendances remplacées (mock_db + utilisateur injecté).
"""

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
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


# ── GET /profiles/me ───────────────────────────────────────────────────────

def test_get_my_profile(app_client, mock_db, student):
    """GET /profiles/me → retourne le profil de l'utilisateur connecté."""
    student.phone              = None
    student.avatar_url         = None
    student.preferred_language = "fr"
    student.created_at         = datetime.now(timezone.utc)

    with patch("src.services.profiles.get_full_profile") as mock_get:
        mock_get.return_value = {
            "id":                 str(student.id),
            "email":              student.email,
            "full_name":          student.full_name,
            "role":               "student",
            "phone":              None,
            "avatar_url":         None,
            "preferred_language": "fr",
            "is_active":          True,
            "created_at":         None,
            "student_profile":    None,
            "tutor_profile":      None,
        }
        res = app_client.get("/api/v1/profiles/me")

    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "student"
    assert data["email"] == student.email


def test_get_my_profile_sans_token(app_client_no_auth):
    """Sans token → 401/403."""
    res = app_client_no_auth.get("/api/v1/profiles/me")
    assert res.status_code in (401, 403)


def test_update_my_profile(app_client, mock_db, student):
    """PUT /profiles/me → met à jour le profil."""
    student.phone              = None
    student.avatar_url         = None
    student.preferred_language = "fr"
    student.created_at         = datetime.now(timezone.utc)

    with patch("src.services.profiles.update_basic_profile", return_value=student), \
         patch("src.services.profiles.get_full_profile") as mock_get:
        mock_get.return_value = {
            "id": str(student.id), "email": student.email,
            "full_name": "Nouveau Nom", "role": "student",
            "phone": None, "avatar_url": None,
            "preferred_language": "fr", "is_active": True,
            "created_at": None, "student_profile": None, "tutor_profile": None,
        }
        res = app_client.put("/api/v1/profiles/me",
                             json={"full_name": "Nouveau Nom"})

    assert res.status_code == 200
    assert res.json()["full_name"] == "Nouveau Nom"


# ── GET /assessments/ ─────────────────────────────────────────────────────

def test_list_assessments_vide(app_client, mock_db):
    """Acteur CANOPE sans bilans → liste vide."""
    with patch("src.services.assessments.list_assessments", return_value=[]):
        res = app_client.get("/api/v1/assessments/")

    assert res.status_code == 200
    assert res.json() == []


def test_create_assessment_endpoint(app_client, mock_db):
    """POST /assessments/ → crée un bilan en brouillon."""
    assessment_id = str(uuid.uuid4())
    fake_assessment = {
        "id":                  assessment_id,
        "actor_id":            str(uuid.uuid4()),
        "student_profile_id":  str(uuid.uuid4()),
        "external_young_id":   None,
        "status":              "draft",
        "vak_dominant":        None,
        "riasec_code":         None,
        "disc_dominant":       None,
        "actor_comment":       None,
        "created_at":          None,
    }

    with patch("src.services.assessments.create_assessment",
               return_value=fake_assessment):
        res = app_client.post("/api/v1/assessments/",
                              json={"student_profile_id": str(uuid.uuid4())})

    assert res.status_code == 201
    assert res.json()["status"] == "draft"


# ── GET /resources/ ────────────────────────────────────────────────────────

def test_list_resources_vide(app_client, mock_db):
    """Aucune ressource publiée → liste vide."""
    with patch("src.services.resources.list_resources", return_value=[]):
        res = app_client.get("/api/v1/resources/")

    assert res.status_code == 200
    assert res.json() == []


def test_list_resources_avec_filtre(app_client, mock_db):
    """Filtre par matière appliqué correctement."""
    fake_resource = {
        "id":           str(uuid.uuid4()),
        "publisher_id": str(uuid.uuid4()),
        "title_fr":     "Cours Maths",
        "title_mg":     None,
        "type":         "pdf",
        "subject":      "Maths",
        "grade_level":  "Terminale",
        "file_url":     None,
        "is_premium":   False,
        "is_published": True,
        "created_at":   None,
    }

    with patch("src.services.resources.list_resources",
               return_value=[fake_resource]) as mock_list:
        res = app_client.get("/api/v1/resources/?subject=Maths")

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["subject"] == "Maths"


def test_get_resource_endpoint(app_client, mock_db):
    """GET /resources/{id} → retourne la ressource."""
    resource_id = str(uuid.uuid4())
    fake_resource = {
        "id":           resource_id,
        "publisher_id": str(uuid.uuid4()),
        "title_fr":     "Cours SVT",
        "title_mg":     None,
        "type":         "video",
        "subject":      "SVT",
        "grade_level":  None,
        "file_url":     None,
        "is_premium":   False,
        "is_published": True,
        "created_at":   None,
    }

    with patch("src.services.resources.get_resource",
               return_value=fake_resource):
        res = app_client.get(f"/api/v1/resources/{resource_id}")

    assert res.status_code == 200
    assert res.json()["title_fr"] == "Cours SVT"


def test_delete_resource_endpoint(app_client, mock_db):
    """DELETE /resources/{id} → 204 si autorisé."""
    resource_id = str(uuid.uuid4())

    with patch("src.services.resources.delete_resource", return_value=None):
        res = app_client.delete(f"/api/v1/resources/{resource_id}")

    assert res.status_code == 204
