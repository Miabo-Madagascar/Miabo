"""
Schémas Pydantic communs — pagination, erreurs, réponses génériques.
"""

from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Réponse paginée avec curseur opaque."""
    items:       list[T]
    cursor:      str | None
    has_more:    bool
    total_count: int


class MessageResponse(BaseModel):
    """Réponse simple avec message de confirmation."""
    message: str


class ErrorResponse(BaseModel):
    """Format d'erreur standard FastAPI."""
    detail: str
