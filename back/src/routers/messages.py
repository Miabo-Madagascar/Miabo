"""
Router messagerie — conversations, messages, présence WebSocket.
Préfixe : /api/v1/messages
"""

from fastapi import APIRouter, WebSocket
from src.dependencies import DbDep, CurrentUser

router = APIRouter(prefix="/messages", tags=["Messagerie"])


@router.get("/conversations")
async def list_conversations(current_user: CurrentUser, db: DbDep):
    """Liste les conversations de l'utilisateur. TODO PHASE 5."""
    raise NotImplementedError


@router.get("/conversations/{conv_id}")
async def get_conversation(conv_id: str, current_user: CurrentUser, db: DbDep):
    """Messages d'une conversation avec pagination curseur. TODO PHASE 5."""
    raise NotImplementedError


@router.post("/", status_code=201)
async def send_message(current_user: CurrentUser, db: DbDep):
    """Envoie un message dans une conversation. TODO PHASE 5."""
    raise NotImplementedError


@router.post("/conversations/{conv_id}/read")
async def mark_as_read(conv_id: str, current_user: CurrentUser, db: DbDep):
    """Marque les messages comme lus. TODO PHASE 5."""
    raise NotImplementedError


@router.websocket("/ws/presence")
async def presence_ws(websocket: WebSocket, db: DbDep):
    """
    WebSocket présence en ligne — authentifié via token en paramètre.
    CDC endpoint : /ws/presence. TODO PHASE 5.
    """
    await websocket.accept()
    await websocket.close()
