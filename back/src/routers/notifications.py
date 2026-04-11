from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Annotated
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from src.config.database import get_db
from src.models.enums import NotificationType
from src.dependencies import get_current_user
from src.models.users import Profile
from src.services import notifications as notif_svc

router = APIRouter(prefix="/notifications", tags=["Notifications"])

DbDep = Annotated[Session, Depends(get_db)] if "Annotated" in globals() else Depends(get_db)
DbDep = Depends(get_db)

# ── SCHEMAS ──────────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: UUID
    type: NotificationType
    title: str
    body: Optional[str]
    link: Optional[str]
    related_id: Optional[UUID]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MarkReadRequest(BaseModel):
    notification_ids: List[UUID]

# ── ROUTES ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    db: Session = DbDep,
    current_user: Profile = Depends(get_current_user),
    unread_only: bool = False,
    limit: int = 50
):
    """Liste les notifications de l'utilisateur."""
    return notif_svc.list_notifications(
        db=db,
        user_id=str(current_user.id),
        unread_only=unread_only,
        limit=limit
    )

@router.post("/read", status_code=200)
async def mark_read(
    req: MarkReadRequest,
    db: Session = DbDep,
    current_user: Profile = Depends(get_current_user),
):
    """Marque une ou plusieurs notifications comme lues."""
    updated = notif_svc.mark_notifications_read(
        db, str(current_user.id), [str(i) for i in req.notification_ids]
    )
    return {"updated_count": updated}

@router.post("/read/all", status_code=200)
async def mark_all_read(
    db: Session = DbDep,
    current_user: Profile = Depends(get_current_user),
):
    """Marque toutes les notifications comme lues."""
    updated = notif_svc.mark_all_notifications_read(db, str(current_user.id))
    return {"updated_count": updated}
