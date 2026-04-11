"""
Router ressources pédagogiques CANOPE/COSP.
Préfixe : /api/v1/resources
"""

from fastapi import APIRouter, Query
from src.dependencies import DbDep, CurrentUser
from src.services import resources as svc

router = APIRouter(prefix="/resources", tags=["Ressources CANOPE"])


@router.get("/")
async def list_resources(
    db:          DbDep,
    subject:     str | None = Query(None, description="Filtre par matière"),
    type_filter: str | None = Query(None, alias="type", description="Type de ressource"),
    grade_level: str | None = Query(None, description="Niveau scolaire"),
):
    """Liste les ressources publiées avec filtres optionnels."""
    return svc.list_resources(
        db,
        subject=subject,
        type_filter=type_filter,
        grade_level=grade_level,
    )


@router.post("/", status_code=201)
async def create_resource(
    body: dict, current_user: CurrentUser, db: DbDep,
):
    """Publie une ressource (CANOPE/COSP/Admin uniquement)."""
    return svc.create_resource(db, current_user, body)


@router.get("/{resource_id}")
async def get_resource(resource_id: str, db: DbDep):
    """Détail d'une ressource."""
    return svc.get_resource(db, resource_id)


@router.delete("/{resource_id}", status_code=204)
async def delete_resource(resource_id: str, current_user: CurrentUser, db: DbDep):
    """Supprime une ressource (auteur ou admin uniquement)."""
    svc.delete_resource(db, resource_id, current_user)
