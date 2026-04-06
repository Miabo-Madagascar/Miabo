"""
Tests unitaires — service disponibilités tuteur.
Couvre : list_availabilities, add_availability, delete_availability.
"""

import uuid
from unittest.mock import MagicMock, call
from fastapi import HTTPException

import pytest

from src.models.enums import UserRole
from src.models.profiles import TutorProfile
from src.models.sessions import Availability
from src.schemas.sessions import AvailabilityRequest
from src.services import availabilities as svc
from tests.conftest import make_profile


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_tutor_profile(profile_id) -> TutorProfile:
    """Crée un TutorProfile minimal sans ORM actif."""
    tp = MagicMock(spec=TutorProfile)
    tp.id         = uuid.uuid4()
    tp.profile_id = profile_id
    return tp


def make_slot(tutor_id, day_of_week=1) -> Availability:
    """Crée un Availability minimal."""
    slot = MagicMock(spec=Availability)
    slot.id            = uuid.uuid4()
    slot.tutor_id      = tutor_id
    slot.day_of_week   = day_of_week
    slot.specific_date = None
    slot.start_time    = "08:00"
    slot.end_time      = "10:00"
    slot.is_available  = True
    return slot


# ── _get_tutor_profile ────────────────────────────────────────────────────────

def test_get_tutor_profile_absent(mock_db):
    """Aucun TutorProfile → HTTPException 403."""
    user = make_profile(UserRole.tutor)
    mock_db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        svc._get_tutor_profile(mock_db, user)
    assert exc.value.status_code == 403


# ── list_availabilities ───────────────────────────────────────────────────────

def test_list_availabilities_vide(mock_db):
    """Aucun créneau → liste vide."""
    user = make_profile(UserRole.tutor)
    tp   = make_tutor_profile(user.id)

    def query_side(model):
        q = MagicMock()
        if model is TutorProfile:
            q.filter.return_value.first.return_value = tp
        elif model is Availability:
            q.filter.return_value.order_by.return_value.all.return_value = []
        return q

    mock_db.query.side_effect = query_side
    result = svc.list_availabilities(mock_db, user)
    assert result == []


def test_list_availabilities_retourne_creneaux(mock_db):
    """Créneaux existants → liste sérialisée."""
    user = make_profile(UserRole.tutor)
    tp   = make_tutor_profile(user.id)
    slot = make_slot(tp.id, day_of_week=0)

    def query_side(model):
        q = MagicMock()
        if model is TutorProfile:
            q.filter.return_value.first.return_value = tp
        elif model is Availability:
            q.filter.return_value.order_by.return_value.all.return_value = [slot]
        return q

    mock_db.query.side_effect = query_side
    result = svc.list_availabilities(mock_db, user)
    assert len(result) == 1
    assert result[0]["day_of_week"] == 0


# ── add_availability ──────────────────────────────────────────────────────────

def test_add_availability_recurrent(mock_db):
    """Ajout d'un créneau récurrent (day_of_week) → commit + dict retourné."""
    user = make_profile(UserRole.tutor)
    tp   = make_tutor_profile(user.id)
    mock_db.query.return_value.filter.return_value.first.return_value = tp

    data = AvailabilityRequest(day_of_week=2, start_time="14:00", end_time="16:00")
    result = svc.add_availability(mock_db, user, data)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    assert result["day_of_week"] == 2
    assert result["start_time"] == "14:00"


def test_add_availability_conflit_champs(mock_db):
    """day_of_week ET specific_date renseignés → 422."""
    user = make_profile(UserRole.tutor)
    data = AvailabilityRequest(
        day_of_week=1, specific_date="2026-05-10",
        start_time="08:00", end_time="10:00",
    )
    with pytest.raises(HTTPException) as exc:
        svc.add_availability(mock_db, user, data)
    assert exc.value.status_code == 422


def test_add_availability_aucun_champ(mock_db):
    """Ni day_of_week ni specific_date → 422."""
    user = make_profile(UserRole.tutor)
    data = AvailabilityRequest(start_time="08:00", end_time="10:00")
    with pytest.raises(HTTPException) as exc:
        svc.add_availability(mock_db, user, data)
    assert exc.value.status_code == 422


# ── delete_availability ───────────────────────────────────────────────────────

def test_delete_availability_ok(mock_db):
    """Créneau appartenant au tuteur → suppression OK."""
    user = make_profile(UserRole.tutor)
    tp   = make_tutor_profile(user.id)
    slot = make_slot(tp.id)

    def query_side(model):
        q = MagicMock()
        if model is TutorProfile:
            q.filter.return_value.first.return_value = tp
        elif model is Availability:
            q.filter.return_value.first.return_value = slot
        return q

    mock_db.query.side_effect = query_side
    svc.delete_availability(mock_db, user, str(slot.id))

    mock_db.delete.assert_called_once_with(slot)
    mock_db.commit.assert_called_once()


def test_delete_availability_introuvable(mock_db):
    """Créneau inexistant ou hors périmètre → 404."""
    user = make_profile(UserRole.tutor)
    tp   = make_tutor_profile(user.id)

    def query_side(model):
        q = MagicMock()
        if model is TutorProfile:
            q.filter.return_value.first.return_value = tp
        elif model is Availability:
            q.filter.return_value.first.return_value = None
        return q

    mock_db.query.side_effect = query_side
    with pytest.raises(HTTPException) as exc:
        svc.delete_availability(mock_db, user, str(uuid.uuid4()))
    assert exc.value.status_code == 404
