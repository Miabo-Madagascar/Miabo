"""
Statistiques agrégées des bilans d'orientation — dashboard CANOPE/COSP.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session as DbSession

from src.models.canope import Assessment
from src.models.users import Profile
from src.models.enums import AssessmentStatus
from src.services.assessment_helpers import get_canope_profile


def get_assessment_stats(db: DbSession, user: Profile) -> dict:
    """Statistiques agrégées des bilans pour le dashboard CANOPE/COSP."""
    cp  = get_canope_profile(db, user)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Base filtrée sur l'acteur courant — chaque .filter() crée une nouvelle requête
    q           = db.query(Assessment).filter(Assessment.administered_by == cp.id)
    total       = q.count()
    draft       = q.filter(Assessment.status == AssessmentStatus.draft).count()
    in_progress = q.filter(Assessment.status == AssessmentStatus.in_progress).count()
    validated   = q.filter(Assessment.status == AssessmentStatus.validated).count()
    this_month  = q.filter(Assessment.created_at >= month_start).count()

    return {
        "total":           total,
        "draft":           draft,
        "in_progress":     in_progress,
        "validated":       validated,
        "this_month":      this_month,
        "completion_rate": round(validated / total * 100) if total > 0 else 0,
    }
