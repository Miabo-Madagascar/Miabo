"""
Service notifications — création et envoi de notifications.
Utilisé par tous les autres services (sessions, paiements, messages).
"""

from sqlalchemy.orm import Session
from src.models.notifications import Notification
from src.models.enums import NotificationType


def create_notification(
    db: Session,
    user_id: str,
    notification_type: NotificationType,
    title: str,
    body: str,
    related_id: str | None = None,
) -> Notification:
    """Crée une notification en BDD pour un utilisateur."""
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        body=body,
        related_id=related_id,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    # Supabase Realtime diffuse automatiquement l'INSERT aux abonnés autorisés
    return notif


def mark_notifications_read(
    db: Session,
    user_id: str,
    notification_ids: list[str],
) -> int:
    """Marque des notifications comme lues. Retourne le nombre mis à jour."""
    updated = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.id.in_(notification_ids),
        )
        .update({"is_read": True}, synchronize_session="fetch")
    )
    db.commit()
    return updated
