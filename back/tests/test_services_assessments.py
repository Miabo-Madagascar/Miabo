"""
Tests unitaires — service bilans d'orientation.
Couvre : calcul VAK/RIASEC/DISC, create, submit_*, validate, get.
"""

import uuid
from unittest.mock import MagicMock
from fastapi import HTTPException

import pytest

from src.models.enums import AssessmentStatus, UserRole
from src.models.canope import Assessment
from src.models.canope_users import CanopProfile
from src.schemas.assessments import (
    CreateAssessmentRequest, VakRequest, RiasecRequest,
    DiscRequest, ValidateAssessmentRequest,
)
from src.services import assessments as svc
from tests.conftest import make_profile


# ── Helpers ──────────────────────────────────────────────────────────────��────

def make_canope_profile(profile_id) -> CanopProfile:
    cp             = MagicMock(spec=CanopProfile)
    cp.id          = uuid.uuid4()
    cp.profile_id  = profile_id
    return cp


def make_assessment(cp_id, status=AssessmentStatus.draft) -> Assessment:
    a                   = MagicMock(spec=Assessment)
    a.id                = uuid.uuid4()
    a.administered_by   = cp_id
    a.student_profile_id = uuid.uuid4()
    a.external_young_id = None
    a.serie             = None
    a.career_interest   = None
    a.vak_v_score       = None
    a.vak_a_score       = None
    a.vak_k_score       = None
    a.vak_dominant      = None
    a.riasec_scores     = None
    a.riasec_code       = None
    a.disc_scores       = None
    a.disc_dominant     = None
    a.actor_comment     = None
    a.status            = status
    a.created_at        = None
    a.validated_at      = None
    return a


def db_with_canope(mock_db, cp, assessment=None):
    def side(model):
        q = MagicMock()
        if model is CanopProfile:
            q.filter.return_value.first.return_value = cp
        elif model is Assessment:
            q.filter.return_value.first.return_value = assessment
            q.filter.return_value.order_by.return_value.all.return_value = (
                [assessment] if assessment else []
            )
        return q
    mock_db.query.side_effect = side
    return mock_db


# ── Calculs ───────────────────────────────────────────────────────────────────

def test_vak_dominant_v():
    assert svc._vak_dominant(10, 5, 8) == "V"

def test_vak_dominant_k():
    assert svc._vak_dominant(4, 4, 11) == "K"

def test_riasec_code():
    scores = {"R": 4, "I": 7, "A": 2, "S": 9, "E": 5, "C": 3}
    code = svc._riasec_code(scores)
    assert len(code) == 2
    assert "S" in code
    assert "I" in code

def test_disc_dominant():
    assert svc._disc_dominant({"D": 12, "I": 18, "S": 9, "C": 15}) == "I"


# ── create_assessment ─────────────────────────────────────────────────────────

def test_create_assessment_option_a(mock_db):
    """Option A (élève MIABO) → bilan créé, statut draft."""
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    db_with_canope(mock_db, cp)

    data   = CreateAssessmentRequest(student_profile_id=str(uuid.uuid4()))
    result = svc.create_assessment(mock_db, user, data)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    assert result["status"] == "draft"


def test_create_assessment_conflit_champs(mock_db):
    """Les deux champs renseignés → 422."""
    user = make_profile(UserRole.canope)
    data = CreateAssessmentRequest(
        student_profile_id=str(uuid.uuid4()),
        external_young_id=str(uuid.uuid4()),
    )
    with pytest.raises(HTTPException) as exc:
        svc.create_assessment(mock_db, user, data)
    assert exc.value.status_code == 422


# ── submit_vak ────────────────────────────────────────────────────────────────

def test_submit_vak(mock_db):
    """Scores VAK soumis → dominant calculé, statut in_progress."""
    user  = make_profile(UserRole.canope)
    cp    = make_canope_profile(user.id)
    a     = make_assessment(cp.id)
    db_with_canope(mock_db, cp, a)

    result = svc.submit_vak(mock_db, str(a.id), user, VakRequest(v_score=8, a_score=5, k_score=6))

    assert a.vak_dominant == "V"
    assert a.status == AssessmentStatus.in_progress


# ── submit_riasec ─────────────────────────────────────────────────────────────

def test_submit_riasec(mock_db):
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    a    = make_assessment(cp.id)
    db_with_canope(mock_db, cp, a)

    svc.submit_riasec(mock_db, str(a.id), user, RiasecRequest(R=3, I=8, A=2, S=7, E=4, C=1))

    assert a.riasec_code is not None
    assert len(a.riasec_code) == 2


# ── validate_assessment ───────────────────────────────────────────────────────

def test_validate_sans_tests_complets(mock_db):
    """Validation sans VAK/RIASEC/DISC → 422."""
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    a    = make_assessment(cp.id, AssessmentStatus.in_progress)
    # vak_dominant absent
    a.vak_dominant  = None
    a.riasec_code   = "SI"
    a.disc_dominant = "I"
    db_with_canope(mock_db, cp, a)

    with pytest.raises(HTTPException) as exc:
        svc.validate_assessment(mock_db, str(a.id), user, ValidateAssessmentRequest())
    assert exc.value.status_code == 422


def test_validate_ok(mock_db):
    """Tous les tests complétés → statut validated."""
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    a    = make_assessment(cp.id, AssessmentStatus.in_progress)
    a.vak_dominant  = "V"
    a.riasec_code   = "SI"
    a.disc_dominant = "I"
    db_with_canope(mock_db, cp, a)

    svc.validate_assessment(mock_db, str(a.id), user, ValidateAssessmentRequest(actor_comment="OK"))
    assert a.status == AssessmentStatus.validated
