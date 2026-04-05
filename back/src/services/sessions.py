"""
Service sessions — machine à états, création, confirmation, annulation.
Cycle : pending_parent|pending_tutor → confirmed → in_progress → completed
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session as DbSession
from fastapi import HTTPException, status

from src.models.sessions import Session as SessionModel
from src.models.users import Profile
from src.models.enums import SessionStatus, UserRole

# ── Transitions autorisées par la machine à états ─────────────────────────

_TRANSITIONS: dict[SessionStatus, set[SessionStatus]] = {
    SessionStatus.pending_parent: {SessionStatus.pending_tutor, SessionStatus.cancelled},
    SessionStatus.pending_tutor:  {SessionStatus.confirmed,     SessionStatus.cancelled},
    SessionStatus.confirmed:      {SessionStatus.in_progress,   SessionStatus.cancelled},
    SessionStatus.in_progress:    {SessionStatus.completed,     SessionStatus.disputed},
    SessionStatus.completed:      set(),
    SessionStatus.cancelled:      set(),
    SessionStatus.disputed:       {SessionStatus.completed, SessionStatus.cancelled},
}


def _assert_transition(current: SessionStatus, target: SessionStatus) -> None:
    """Lève 409 si la transition est interdite."""
    if target not in _TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transition interdite : {current.value} -> {target.value}",
        )


def _compute_amount(hourly_rate: int, duration_minutes: int) -> int:
    """Montant = tarif horaire * (durée / 60), arrondi."""
    return round(hourly_rate * duration_minutes / 60)


# ── CRUD ──────────────────────────────────────────────────────────────────

def create_session(
    db: DbSession,
    requester: Profile,
    tutor_id: str,
    subject: str,
    scheduled_at: datetime,
    duration_minutes: int,
    mode: str,
    objectives: str | None = None,
) -> SessionModel:
    """
    Crée une demande de réservation.
    Statut initial : pending_parent si élève avec parent lié, sinon pending_tutor.
    """
    from src.models.users import ParentStudentLink
    from src.models.profiles import TutorProfile

    tutor_profile = (
        db.query(TutorProfile)
        .join(Profile, Profile.id == TutorProfile.profile_id)
        .filter(Profile.id == tutor_id, TutorProfile.validation_status == "validated")
        .first()
    )
    if not tutor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tuteur introuvable ou non validé",
        )

    needs_parent = False
    if requester.role == UserRole.student:
        parent_link = (
            db.query(ParentStudentLink)
            .filter(
                ParentStudentLink.student_id == requester.id,
                ParentStudentLink.verified.is_(True),
            )
            .first()
        )
        needs_parent = parent_link is not None

    initial_status = (
        SessionStatus.pending_parent if needs_parent
        else SessionStatus.pending_tutor
    )

    amount = _compute_amount(tutor_profile.hourly_rate, duration_minutes)

    session = SessionModel(
        id=uuid.uuid4(),
        student_id=requester.id,
        tutor_id=tutor_id,
        status=initial_status,
        subject=subject,
        mode=mode,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        amount_ariary=amount,
        student_objectives=objectives,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(
    db: DbSession,
    requester: Profile,
    status_filter: SessionStatus | None = None,
) -> list[SessionModel]:
    """Retourne les sessions accessibles à l'utilisateur connecté."""
    if requester.role == UserRole.student:
        q = db.query(SessionModel).filter(SessionModel.student_id == requester.id)
    elif requester.role == UserRole.tutor:
        q = db.query(SessionModel).filter(SessionModel.tutor_id == requester.id)
    elif requester.role == UserRole.parent:
        from src.models.users import ParentStudentLink
        child_ids = [
            row.student_id
            for row in db.query(ParentStudentLink).filter(
                ParentStudentLink.parent_id == requester.id
            )
        ]
        q = db.query(SessionModel).filter(SessionModel.student_id.in_(child_ids))
    else:
        q = db.query(SessionModel)

    if status_filter:
        q = q.filter(SessionModel.status == status_filter)

    return q.order_by(SessionModel.scheduled_at.desc()).all()


def get_session(
    db: DbSession, session_id: str, requester: Profile
) -> SessionModel:
    """Retourne la session si l'utilisateur y a accès."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session introuvable",
        )
    _assert_access(session, requester)
    return session


def confirm_session(
    db: DbSession,
    session: SessionModel,
    requester: Profile,
    accepted: bool,
    reason: str | None = None,
) -> SessionModel:
    """Tuteur accepte (→ confirmed) ou refuse (→ cancelled)."""
    if requester.role != UserRole.tutor or str(requester.id) != str(session.tutor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul le tuteur concerné peut confirmer cette session",
        )
    _assert_transition(session.status, SessionStatus.pending_tutor)

    if accepted:
        session.status = SessionStatus.confirmed
    else:
        session.status = SessionStatus.cancelled
        session.cancelled_by = requester.id

    db.commit()
    db.refresh(session)
    return session


def approve_parent(
    db: DbSession,
    session: SessionModel,
    requester: Profile,
    approved: bool,
) -> SessionModel:
    """Parent valide (→ pending_tutor) ou refuse (→ cancelled)."""
    if requester.role != UserRole.parent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un parent peut approuver cette session",
        )
    _assert_transition(session.status, SessionStatus.pending_tutor)

    if approved:
        session.status = SessionStatus.pending_tutor
        session.parent_approved_at = datetime.now(timezone.utc)
    else:
        session.status = SessionStatus.cancelled
        session.cancelled_by = requester.id

    db.commit()
    db.refresh(session)
    return session


def cancel_session(
    db: DbSession,
    session: SessionModel,
    requester: Profile,
) -> SessionModel:
    """Annule une session."""
    allowed = {UserRole.student, UserRole.tutor, UserRole.parent, UserRole.admin}
    if requester.role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non autorisé à annuler cette session",
        )
    _assert_transition(session.status, SessionStatus.cancelled)
    session.status = SessionStatus.cancelled
    session.cancelled_by = requester.id
    db.commit()
    db.refresh(session)
    return session


def session_to_dict(session: SessionModel, db: DbSession) -> dict:
    """Sérialise une session avec les noms des participants."""
    student = db.query(Profile).filter(Profile.id == session.student_id).first()
    tutor   = db.query(Profile).filter(Profile.id == session.tutor_id).first()
    return {
        "id":               str(session.id),
        "status":           session.status.value,
        "subject":          session.subject,
        "mode":             session.mode,
        "scheduled_at":     session.scheduled_at.isoformat(),
        "duration_minutes": session.duration_minutes,
        "amount_ariary":    session.amount_ariary,
        "student_objectives": session.student_objectives,
        "tutor_notes":      session.tutor_notes,
        "meeting_url":      session.meeting_url,
        "parent_approved_at": (
            session.parent_approved_at.isoformat()
            if session.parent_approved_at else None
        ),
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "student": _profile_mini(student),
        "tutor":   _profile_mini(tutor),
    }


def _profile_mini(p: Profile | None) -> dict | None:
    if not p:
        return None
    return {"id": str(p.id), "full_name": p.full_name, "avatar_url": p.avatar_url}


def _assert_access(session: SessionModel, requester: Profile) -> None:
    """Vérifie que l'utilisateur peut accéder à cette session."""
    privileged = {UserRole.admin, UserRole.canope, UserRole.cosp}
    if requester.role in privileged:
        return
    user_id = str(requester.id)
    if user_id in (str(session.student_id), str(session.tutor_id)):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Accès refusé à cette session",
    )
