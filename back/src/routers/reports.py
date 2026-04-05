"""
Router rapports — génération PDF mensuel élève, analytics tuteur.
Préfixe : /api/v1/reports
CDC endpoint : GET /api/v1/reports/monthly/{student_id}
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/reports", tags=["Rapports"])


@router.get("/monthly/{student_id}")
async def get_monthly_report(
    student_id: str,
    current_user: CurrentUser,
    db: DbDep,
) -> StreamingResponse:
    """
    Génère le rapport mensuel PDF d'un élève.
    Accessible : tuteur ayant eu une session ce mois, parent lié, admin.
    Généré avec WeasyPrint. TODO PHASE 6.
    """
    raise NotImplementedError


@router.get("/tutor/analytics")
async def get_tutor_analytics(current_user: CurrentUser, db: DbDep):
    """Analytics du tuteur connecté (sessions, revenus, note). TODO PHASE 3."""
    raise NotImplementedError
