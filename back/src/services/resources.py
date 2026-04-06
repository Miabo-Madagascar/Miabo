"""
Service ressources pédagogiques CANOPE — CRUD + filtres.
"""

import uuid
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.canope import Resource
from src.models.users import Profile
from src.models.enums import ResourceType, UserRole


def _to_dict(r: Resource) -> dict:
    return {
        "id":           str(r.id),
        "publisher_id": str(r.publisher_id),
        "title_fr":     r.title_fr,
        "title_mg":     r.title_mg,
        "type":         r.type.value if hasattr(r.type, "value") else r.type,
        "subject":      r.subject,
        "grade_level":  r.grade_level,
        "file_url":     r.file_url,
        "is_premium":   r.is_premium,
        "is_published": r.is_published,
        "created_at":   r.created_at.isoformat() if r.created_at else None,
    }


def list_resources(
    db:          DbSession,
    subject:     str | None = None,
    type_filter: str | None = None,
    grade_level: str | None = None,
    published_only: bool    = True,
) -> list[dict]:
    """Liste les ressources avec filtres optionnels."""
    q = db.query(Resource)
    if published_only:
        q = q.filter(Resource.is_published.is_(True))
    if subject:
        q = q.filter(Resource.subject.ilike(f"%{subject}%"))
    if type_filter:
        q = q.filter(Resource.type == type_filter)
    if grade_level:
        q = q.filter(Resource.grade_level == grade_level)
    rows = q.order_by(Resource.created_at.desc()).all()
    return [_to_dict(r) for r in rows]


def create_resource(db: DbSession, publisher: Profile, data: dict) -> dict:
    """Publie une ressource — réservé aux rôles CANOPE et COSP."""
    if publisher.role not in (UserRole.canope, UserRole.cosp, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les acteurs CANOPE/COSP peuvent publier des ressources.",
        )
    r = Resource(
        id           = uuid.uuid4(),
        publisher_id = publisher.id,
        title_fr     = data["title_fr"],
        title_mg     = data.get("title_mg"),
        type         = data["type"],
        subject      = data["subject"],
        grade_level  = data.get("grade_level"),
        file_url     = data.get("file_url"),
        is_premium   = data.get("is_premium", False),
        is_published = data.get("is_published", False),
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return _to_dict(r)


def get_resource(db: DbSession, resource_id: str) -> dict:
    """Retourne une ressource par son ID."""
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Ressource introuvable")
    return _to_dict(r)


def delete_resource(db: DbSession, resource_id: str, user: Profile) -> None:
    """Supprime une ressource — auteur ou admin uniquement."""
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Ressource introuvable")
    if str(r.publisher_id) != str(user.id) and user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Non autorisé")
    db.delete(r)
    db.commit()
