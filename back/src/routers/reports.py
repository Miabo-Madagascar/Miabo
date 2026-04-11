"""
Router rapports — génération PDF des bilans d'orientation + analytics tuteur.
Préfixe : /api/v1/reports
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from src.dependencies import DbDep, CurrentUser
from src.services import reports as svc

router = APIRouter(prefix="/reports", tags=["Rapports"])


@router.get("/assessments/{assessment_id}/pdf")
async def get_assessment_pdf(
    assessment_id: str,
    current_user:  CurrentUser,
    db:            DbDep,
) -> StreamingResponse:
    """
    Génère le PDF du bilan d'orientation.
    Accessible : acteur CANOPE/COSP propriétaire + Admin.
    """
    pdf_bytes = svc.generate_assessment_pdf(db, assessment_id, current_user)

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="bilan-{assessment_id[:8]}.pdf"'
            ),
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.get("/tutor/analytics")
async def get_tutor_analytics(current_user: CurrentUser, db: DbDep) -> JSONResponse:
    """
    Analytics du tuteur connecté — sessions ce mois, revenus, note moyenne.
    TODO : implémenter après connexion BDD en production.
    """
    from src.models.enums import UserRole
    from fastapi import HTTPException, status

    if current_user.role not in (UserRole.tutor, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Réservé aux tuteurs et admins",
        )

    # Placeholder — remplacer par les vraies requêtes BDD
    return JSONResponse(content={
        "sessions_this_month": 0,
        "total_earnings":      0,
        "avg_rating":          0.0,
        "pending_sessions":    0,
    })
