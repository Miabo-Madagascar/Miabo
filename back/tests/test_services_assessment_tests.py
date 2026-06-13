"""
Tests unitaires — soumission des scores VAK/RIASEC/DISC (assessment_tests.py, CANOPE/COSP).
"""

from src.models.enums import AssessmentStatus, UserRole
from src.schemas.assessments import VakRequest, RiasecRequest
from src.services import assessment_tests as svc_tests
from tests.conftest import make_profile
from tests.assessment_factories import make_canope_profile, make_assessment, db_with_canope


def test_submit_vak(mock_db):
    """Scores VAK soumis → dominant calculé, statut in_progress."""
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    a    = make_assessment(cp.id)
    db_with_canope(mock_db, cp, a)

    svc_tests.submit_vak(mock_db, str(a.id), user, VakRequest(v_score=8, a_score=5, k_score=6))

    assert a.vak_dominant == "V"
    assert a.status == AssessmentStatus.in_progress


def test_submit_riasec(mock_db):
    """Scores RIASEC soumis → code de Holland (3 lettres) calculé."""
    user = make_profile(UserRole.canope)
    cp   = make_canope_profile(user.id)
    a    = make_assessment(cp.id)
    db_with_canope(mock_db, cp, a)

    svc_tests.submit_riasec(mock_db, str(a.id), user, RiasecRequest(R=3, I=8, A=2, S=7, E=4, C=1))

    assert a.riasec_code is not None
    assert len(a.riasec_code) == 3
