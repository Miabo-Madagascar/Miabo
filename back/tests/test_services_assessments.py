"""
Tests unitaires — service bilans d'orientation (assessments.py).
Couvre : create_assessment, validate_assessment.
"""

import uuid
from fastapi import HTTPException

import pytest

from src.models.enums import AssessmentStatus, UserRole
from src.schemas.assessments import CreateAssessmentRequest, ValidateAssessmentRequest
from src.services import assessments as svc
from tests.conftest import make_profile
from tests.assessment_factories import make_canope_profile, make_assessment, db_with_canope


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


# ── validate_assessment ───────────────────────────────────────────────────────

def test_validate_sans_tests_complets(mock_db):
    """Validation sans VAK/RIASEC/DISC → 422."""
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    a    = make_assessment(cp.id, AssessmentStatus.in_progress)
    # vak_dominant absent
    a.vak_dominant  = None
    a.riasec_code   = "SIE"
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
    a.riasec_code   = "SIE"
    a.disc_dominant = "I"
    db_with_canope(mock_db, cp, a)

    svc.validate_assessment(mock_db, str(a.id), user, ValidateAssessmentRequest(actor_comment="OK"))
    assert a.status == AssessmentStatus.validated
