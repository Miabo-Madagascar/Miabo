"""
Router messagerie — conversations, messages, accusés de lecture, SSE.
Préfixe : /api/v1/messages
"""

import asyncio
import json

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from src.dependencies import DbDep, CurrentUser
from src.services import messages as messages_svc
from src.services.sse_manager import sse_manager

router = APIRouter(prefix="/messages", tags=["Messagerie"])


class SendMessageRequest(BaseModel):
    conversation_id: str
    content:         str
    message_type:    str = "text"

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Le message ne peut pas être vide")
        return v.strip()


class CreateConversationRequest(BaseModel):
    other_user_id: str
    session_id:    str | None = None


@router.get("/conversations")
async def list_conversations(current_user: CurrentUser, db: DbDep):
    """Liste les conversations de l'utilisateur, triées par activité."""
    return messages_svc.list_conversations(db, current_user)


@router.post("/conversations", status_code=201)
async def create_conversation(
    body: CreateConversationRequest,
    current_user: CurrentUser,
    db: DbDep,
):
    """Crée ou retourne une conversation existante entre deux utilisateurs."""
    return messages_svc.get_or_create_conversation(
        db, current_user,
        other_user_id=body.other_user_id,
        session_id=body.session_id,
    )


@router.get("/conversations/{conv_id}")
async def get_conversation(
    conv_id:      str,
    current_user: CurrentUser,
    db:           DbDep,
    limit:        int = Query(50, ge=1, le=100),
    before:       str | None = Query(None, description="Curseur pagination"),
):
    """Messages d'une conversation avec pagination curseur."""
    return messages_svc.get_conversation_messages(
        db, conv_id, current_user, limit=limit, before=before
    )


@router.get("/conversations/{conv_id}/stream")
async def stream_messages(
    conv_id:      str,
    current_user: CurrentUser,
    db:           DbDep,
):
    """SSE — flux temps réel des nouveaux messages d'une conversation."""
    # Vérifie que l'utilisateur est bien participant avant d'ouvrir le flux
    messages_svc._check_participant(db, conv_id, current_user)

    async def event_stream():
        q = await sse_manager.subscribe(conv_id)
        try:
            while True:
                try:
                    data = await asyncio.wait_for(q.get(), timeout=25)
                    yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    # Keepalive toutes les 25 s pour maintenir la connexion
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            sse_manager.unsubscribe(conv_id, q)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",  # désactive le buffer Nginx/proxy
        },
    )


@router.post("/", status_code=201)
async def send_message(
    body:         SendMessageRequest,
    current_user: CurrentUser,
    db:           DbDep,
):
    """Envoie un message et le diffuse aux abonnés SSE de la conversation."""
    msg = messages_svc.send_message(
        db,
        conv_id=body.conversation_id,
        content=body.content,
        current_user=current_user,
        message_type=body.message_type,
    )
    # Diffuse aux clients SSE connectés sur cette conversation
    await sse_manager.publish(body.conversation_id, msg)
    return msg


@router.post("/conversations/{conv_id}/read")
async def mark_as_read(conv_id: str, current_user: CurrentUser, db: DbDep):
    """Marque tous les messages de la conversation comme lus."""
    return messages_svc.mark_as_read(db, conv_id, current_user)
