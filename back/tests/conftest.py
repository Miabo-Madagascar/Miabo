"""
Fixtures partagées entre tous les tests.

Stratégie :
- Tests unitaires (services) : DB mockée via MagicMock — aucune connexion réelle
- Tests d'intégration (routers) : TestClient FastAPI avec dépendances remplacées
"""

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock
from typing import Generator

import pytest
from fastapi.testclient import TestClient

from src.models.enums import UserRole


# ── Factories ─────────────────────────────────────────────────────────────

def make_profile(role: UserRole, user_id: str | None = None) -> SimpleNamespace:
    """
    Crée un objet profil léger sans passer par SQLAlchemy.
    SimpleNamespace évite le déclenchement de l'instrumentation ORM
    qui requiert une session active pour `__new__`.
    """
    return SimpleNamespace(
        id         = uuid.UUID(user_id) if user_id else uuid.uuid4(),
        email      = f"{role.value}@test.miabo.mg",
        full_name  = f"Test {role.value.capitalize()}",
        role       = role,
        is_active  = True,
        avatar_url = None,
    )


# ── Fixtures profils ───────────────────────────────────────────────────────

@pytest.fixture
def student() -> SimpleNamespace:
    return make_profile(UserRole.student)


@pytest.fixture
def tutor() -> SimpleNamespace:
    return make_profile(UserRole.tutor)


@pytest.fixture
def admin() -> SimpleNamespace:
    return make_profile(UserRole.admin)


# ── Fixture DB mockée ──────────────────────────────────────────────────────

@pytest.fixture
def mock_db() -> MagicMock:
    """
    Session SQLAlchemy entièrement mockée.
    Les tests configurent les return_value selon leurs besoins.
    """
    db = MagicMock()
    db.add    = MagicMock()
    db.commit = MagicMock()
    db.flush  = MagicMock()

    def _fake_refresh(obj) -> None:
        """
        Simule db.refresh() : injecte created_at si l'objet n'en a pas encore.
        SQLAlchemy le ferait via server_default après un vrai commit.
        """
        if not getattr(obj, "created_at", None):
            obj.created_at = datetime.now(timezone.utc)

    db.refresh = MagicMock(side_effect=_fake_refresh)
    return db


# ── Fixture TestClient ─────────────────────────────────────────────────────

@pytest.fixture
def app_client(mock_db: MagicMock, student: SimpleNamespace) -> Generator:
    """
    TestClient avec dépendances remplacées :
    - get_db       → mock_db (pas de vraie connexion)
    - get_current_user → student (pas de JWT requis)
    """
    from main import app
    from src.dependencies import get_db, get_current_user

    app.dependency_overrides[get_db]           = lambda: mock_db
    app.dependency_overrides[get_current_user] = lambda: student

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def app_client_no_auth() -> Generator:
    """TestClient sans utilisateur injecté — teste les routes protégées."""
    from main import app
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client
