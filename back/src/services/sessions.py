"""
Service sessions — logique métier réservations.
Appelé par src/routers/sessions.py. Ne pas appeler depuis d'autres routers.
"""

from sqlalchemy.orm import Session
from src.models.sessions import Session as SessionModel
from src.models.enums import SessionStatus


def get_sessions_for_user(db: Session, user_id: str) -> list[SessionModel]:
    """Retourne les sessions où l'utilisateur est élève ou tuteur."""
    return (
        db.query(SessionModel)
        .filter(
            (SessionModel.student_id == user_id) |
            (SessionModel.tutor_id == user_id)
        )
        .order_by(SessionModel.scheduled_at.desc())
        .all()
    )


def confirm_session(
    db: Session,
    session_id: str,
    tutor_id: str,
    accepted: bool,
    reason: str | None = None,
) -> SessionModel | None:
    """
    Tuteur accepte (confirmed) ou refuse (cancelled) une session pending.
    Retourne None si la session n'existe pas ou n'appartient pas au tuteur.
    """
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.id == session_id,
            SessionModel.tutor_id == tutor_id,
            SessionModel.status == SessionStatus.pending,
        )
        .first()
    )
    if not session:
        return None

    session.status = SessionStatus.confirmed if accepted else SessionStatus.cancelled
    db.commit()
    db.refresh(session)
    return session


def complete_session(
    db: Session,
    session_id: str,
    tutor_id: str,
) -> SessionModel | None:
    """Passe la session en 'completed' — déclenche libération escrow."""
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.id == session_id,
            SessionModel.tutor_id == tutor_id,
            SessionModel.status == SessionStatus.confirmed,
        )
        .first()
    )
    if not session:
        return None

    session.status = SessionStatus.completed
    db.commit()
    db.refresh(session)
    # TODO PHASE 4 : déclencher EscrowService.release(session.payment_id)
    return session
