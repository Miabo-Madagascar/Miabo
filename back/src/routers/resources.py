"""
Router ressources pédagogiques CANOPE.
Préfixe : /api/v1/resources
CDC endpoint : GET /api/v1/canope/resources (monté ici)
"""

from fastapi import APIRouter
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/resources", tags=["Ressources CANOPE"])


@router.get("/")
async def list_resources(db: DbDep):
    """
    Liste les ressources avec filtres (type, matière, niveau, premium).
    Accès public pour non-premium, JWT requis pour ressources premium. TODO PHASE 5.
    """
    raise NotImplementedError


@router.post("/", status_code=201)
async def create_resource(current_user: CurrentUser, db: DbDep):
    """Publie une ressource (CANOPE/COSP uniquement). TODO PHASE 5."""
    raise NotImplementedError


@router.get("/{resource_id}")
async def get_resource(resource_id: str, db: DbDep):
    """Détail d'une ressource. TODO PHASE 5."""
    raise NotImplementedError


@router.delete("/{resource_id}", status_code=204)
async def delete_resource(resource_id: str, current_user: CurrentUser, db: DbDep):
    """Supprime une ressource (auteur ou admin). TODO PHASE 5."""
    raise NotImplementedError
