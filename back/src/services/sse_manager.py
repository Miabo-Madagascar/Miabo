"""
Gestionnaire de connexions SSE (Server-Sent Events).

Chaque conversation dispose d'une liste de files asyncio.
Quand un message est envoyé, on publie dans la file de la conversation.
Les abonnés SSE reçoivent l'événement et le transmettent au navigateur.

Limites connues :
- Mémoire uniquement → perte des connexions si le process redémarre
- Ne fonctionne pas en multi-process (workers Gunicorn distincts)
Pour la production, remplacer par Redis Pub/Sub.
"""

import asyncio
from collections import defaultdict


class SSEManager:
    def __init__(self) -> None:
        # conv_id (str) → liste de files d'attente
        self._queues: dict[str, list[asyncio.Queue]] = defaultdict(list)

    async def subscribe(self, conv_id: str) -> asyncio.Queue:
        """Crée et enregistre une nouvelle file pour la conversation."""
        q: asyncio.Queue = asyncio.Queue()
        self._queues[conv_id].append(q)
        return q

    def unsubscribe(self, conv_id: str, q: asyncio.Queue) -> None:
        """Retire la file lors de la déconnexion du client."""
        try:
            self._queues[conv_id].remove(q)
        except (KeyError, ValueError):
            pass

    async def publish(self, conv_id: str, data: dict) -> None:
        """Diffuse un message à tous les abonnés de la conversation."""
        for q in list(self._queues.get(conv_id, [])):
            await q.put(data)


# Singleton partagé par tous les routers
sse_manager = SSEManager()
