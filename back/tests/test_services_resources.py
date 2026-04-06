"""
Tests unitaires — service ressources pédagogiques (src/services/resources.py).
DB mockée via MagicMock — aucune connexion réelle.
"""

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from src.models.enums import UserRole
from tests.conftest import make_profile


# ── Helper ────────────────────────────────────────────────────────────────

def make_resource(publisher_id=None, is_published=True):
    """Crée une ressource légère sans SQLAlchemy."""
    return SimpleNamespace(
        id           = uuid.uuid4(),
        publisher_id = publisher_id or uuid.uuid4(),
        title_fr     = "Cours de Maths Terminale",
        title_mg     = "Lesona Matematika",
        type         = SimpleNamespace(value="pdf"),
        subject      = "Maths",
        grade_level  = "Terminale",
        file_url     = "https://storage.example.com/maths.pdf",
        is_premium   = False,
        is_published = is_published,
        created_at   = datetime.now(timezone.utc),
    )


# ── list_resources ─────────────────────────────────────────────────────────

def test_list_resources_vide():
    """Aucune ressource → liste vide."""
    from src.services.resources import list_resources

    db = MagicMock()
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []

    result = list_resources(db)

    assert result == []


def test_list_resources_retourne_ressources():
    """Deux ressources publiées → liste de deux dicts."""
    from src.services.resources import list_resources

    db = MagicMock()
    r1 = make_resource()
    r2 = make_resource()

    # Chaîne de filtres : published_only → pas d'autres filtres
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [r1, r2]

    result = list_resources(db, published_only=True)

    assert len(result) == 2
    assert result[0]["title_fr"] == "Cours de Maths Terminale"


# ── create_resource ────────────────────────────────────────────────────────

def test_create_resource_canope_ok():
    """Acteur CANOPE peut créer une ressource."""
    from src.services.resources import create_resource

    db        = MagicMock()
    publisher = make_profile(UserRole.canope)
    data = {
        "title_fr":    "Fiche révision",
        "type":        "pdf",
        "subject":     "SVT",
        "is_published": True,
    }

    r = make_resource(publisher_id=publisher.id)
    db.refresh.side_effect = lambda obj: None

    # Patch Resource constructor pour retourner notre mock
    import src.services.resources as mod
    original_cls = mod.Resource

    class FakeResource:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
            self.id           = r.id
            self.publisher_id = publisher.id
            self.type         = SimpleNamespace(value=kwargs.get("type", "pdf"))
            self.created_at   = datetime.now(timezone.utc)

    mod.Resource = FakeResource
    try:
        result = create_resource(db, publisher, data)
    finally:
        mod.Resource = original_cls

    db.add.assert_called_once()
    db.commit.assert_called_once()
    assert result["subject"] == "SVT"


def test_create_resource_cosp_ok():
    """Acteur COSP peut également créer une ressource."""
    from src.services.resources import create_resource

    db        = MagicMock()
    publisher = make_profile(UserRole.cosp)
    data      = {"title_fr": "Guide", "type": "video", "subject": "Orientation"}

    import src.services.resources as mod
    original_cls = mod.Resource

    class FakeResource:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
            self.id           = uuid.uuid4()
            self.publisher_id = publisher.id
            self.type         = SimpleNamespace(value=kwargs.get("type", "video"))
            self.created_at   = datetime.now(timezone.utc)

    mod.Resource = FakeResource
    try:
        result = create_resource(db, publisher, data)
    finally:
        mod.Resource = original_cls

    db.commit.assert_called_once()


def test_create_resource_student_interdit():
    """Un élève ne peut pas publier de ressource → 403."""
    from src.services.resources import create_resource

    db        = MagicMock()
    publisher = make_profile(UserRole.student)
    data      = {"title_fr": "Triche", "type": "pdf", "subject": "Maths"}

    with pytest.raises(HTTPException) as exc:
        create_resource(db, publisher, data)

    assert exc.value.status_code == 403


def test_create_resource_tutor_interdit():
    """Un tuteur ne peut pas publier de ressource → 403."""
    from src.services.resources import create_resource

    db        = MagicMock()
    publisher = make_profile(UserRole.tutor)
    data      = {"title_fr": "Cours", "type": "pdf", "subject": "Maths"}

    with pytest.raises(HTTPException) as exc:
        create_resource(db, publisher, data)

    assert exc.value.status_code == 403


# ── get_resource ───────────────────────────────────────────────────────────

def test_get_resource_ok():
    """Ressource existante → dict retourné."""
    from src.services.resources import get_resource

    db = MagicMock()
    r  = make_resource()
    db.query.return_value.filter.return_value.first.return_value = r

    result = get_resource(db, str(r.id))

    assert result["title_fr"] == "Cours de Maths Terminale"


def test_get_resource_introuvable():
    """Ressource absente → 404."""
    from src.services.resources import get_resource

    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        get_resource(db, str(uuid.uuid4()))

    assert exc.value.status_code == 404


# ── delete_resource ────────────────────────────────────────────────────────

def test_delete_resource_par_auteur():
    """L'auteur peut supprimer sa propre ressource."""
    from src.services.resources import delete_resource

    db   = MagicMock()
    user = make_profile(UserRole.canope)
    r    = make_resource(publisher_id=user.id)

    db.query.return_value.filter.return_value.first.return_value = r

    delete_resource(db, str(r.id), user)

    db.delete.assert_called_once_with(r)
    db.commit.assert_called_once()


def test_delete_resource_par_admin():
    """Un admin peut supprimer n'importe quelle ressource."""
    from src.services.resources import delete_resource

    db    = MagicMock()
    admin = make_profile(UserRole.admin)
    r     = make_resource(publisher_id=uuid.uuid4())  # autre auteur

    db.query.return_value.filter.return_value.first.return_value = r

    delete_resource(db, str(r.id), admin)

    db.delete.assert_called_once_with(r)


def test_delete_resource_non_autorise():
    """Utilisateur non-auteur et non-admin → 403."""
    from src.services.resources import delete_resource

    db   = MagicMock()
    user = make_profile(UserRole.canope)
    r    = make_resource(publisher_id=uuid.uuid4())  # auteur différent

    db.query.return_value.filter.return_value.first.return_value = r

    with pytest.raises(HTTPException) as exc:
        delete_resource(db, str(r.id), user)

    assert exc.value.status_code == 403


def test_delete_resource_introuvable():
    """Ressource absente → 404."""
    from src.services.resources import delete_resource

    db   = MagicMock()
    user = make_profile(UserRole.admin)
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        delete_resource(db, str(uuid.uuid4()), user)

    assert exc.value.status_code == 404
