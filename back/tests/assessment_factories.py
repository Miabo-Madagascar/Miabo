"""
Factories partagées — tests des services bilans d'orientation
(assessments.py, assessment_tests.py, assessment_stats.py).
"""

import uuid
from unittest.mock import MagicMock

from src.models.enums import AssessmentStatus
from src.models.canope import Assessment
from src.models.canope_users import CanopProfile


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
