"""
Tests unitaires — service sessions.
Couvre : _compute_amount, transitions, create_session, confirm_session, cancel.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

import pytest

from src.models.enums import SessionStatus, UserRole
from src.services import sessions as svc
from tests.conftest import make_profile


# ── _compute_amount ────────────────────────────────────────────────────────

def test_compute_amount_1h():
    assert svc._compute_amount(10_000, 60) == 10_000

def test_compute_amount_90min():
    assert svc._compute_amount(10_000, 90) == 15_000

def test_compute_amount_arrondi():
    # 10 000 Ar/h × 1 h 20 min → 13 333 arrondi
    assert svc._compute_amount(10_000, 80) == 13_333


# ── _assert_transition ─────────────────────────────────────────────────────

def test_transition_valide():
    # pending_tutor → confirmed : autorisé
    svc._assert_transition(SessionStatus.pending_tutor, SessionStatus.confirmed)

def test_transition_invalide():
    # completed → confirmed : interdit
    with pytest.raises(HTTPException) as exc:
        svc._assert_transition(SessionStatus.completed, SessionStatus.confirmed)
    assert exc.value.status_code == 409


# ── create_session ─────────────────────────────────────────────────────────

def _build_db_for_create(mock_db, tutor_profile_obj, parent_link=None):
    """Configure mock_db pour create_session."""
    from src.models.profiles import TutorProfile
    from src.models.users import ParentStudentLink

    def query_side_effect(model):
        q = MagicMock()
        if model is TutorProfile:
            q.join.return_value.filter.return_value.first.return_value = tutor_profile_obj
        elif model is ParentStudentLink:
            q.filter.return_value.first.return_value = parent_link
        return q

    mock_db.query.side_effect = query_side_effect
    return mock_db


def test_create_session_pending_tutor(mock_db, student):
    """Élève sans parent lié → statut pending_tutor."""
    tutor_mock = MagicMock(hourly_rate=10_000)
    db = _build_db_for_create(mock_db, tutor_mock, parent_link=None)

    session = svc.create_session(
        db, requester=student,
        tutor_id=str(uuid.uuid4()),
        subject="Maths",
        scheduled_at=datetime(2026, 5, 1, 14, 0, tzinfo=timezone.utc),
        duration_minutes=60, mode="online",
    )
    assert session.status == SessionStatus.pending_tutor
    db.add.assert_called_once()
    db.commit.assert_called_once()


def test_create_session_pending_parent(mock_db, student):
    """Élève avec parent vérifié → statut pending_parent."""
    tutor_mock  = MagicMock(hourly_rate=10_000)
    parent_mock = MagicMock()
    db = _build_db_for_create(mock_db, tutor_mock, parent_link=parent_mock)

    session = svc.create_session(
        db, requester=student,
        tutor_id=str(uuid.uuid4()), subject="Physique",
        scheduled_at=datetime(2026, 5, 2, 10, 0, tzinfo=timezone.utc),
        duration_minutes=90, mode="in_person",
    )
    assert session.status == SessionStatus.pending_parent


def test_create_session_tuteur_non_valide(mock_db, student):
    """Tuteur introuvable ou non validé → HTTPException 404."""
    from src.models.profiles import TutorProfile
    from src.models.users import ParentStudentLink

    def query_side_effect(model):
        q = MagicMock()
        if model is TutorProfile:
            q.join.return_value.filter.return_value.first.return_value = None
        return q

    mock_db.query.side_effect = query_side_effect

    with pytest.raises(HTTPException) as exc:
        svc.create_session(
            mock_db, requester=student,
            tutor_id=str(uuid.uuid4()), subject="SVT",
            scheduled_at=datetime(2026, 5, 3, 9, 0, tzinfo=timezone.utc),
            duration_minutes=60, mode="online",
        )
    assert exc.value.status_code == 404
