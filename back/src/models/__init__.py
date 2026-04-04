"""
Point d'entrée des modèles SQLAlchemy.
L'import de ce module enregistre tous les modèles sur Base,
ce qui est requis pour que Alembic détecte les changements (autogenerate).
"""

from src.config.database import Base  # noqa: F401

# Domaine Auth & Utilisateurs
from .users import Profile, ParentStudentLink  # noqa: F401
from .profiles import StudentProfile, TutorProfile  # noqa: F401
from .canope_users import CanopProfile, ExternalYoungProfile  # noqa: F401

# Domaine Sessions & Réservations
from .sessions import Session, Availability  # noqa: F401

# Domaine Paiement & Escrow
from .payments import Payment, EscrowTransaction  # noqa: F401

# Domaine CANOPE / COSP / Évaluations
from .canope import Assessment, Resource, Review  # noqa: F401

# Domaine Messagerie & Notifications
from .messaging import Conversation, ConversationParticipant, Message  # noqa: F401
from .notifications import MessageRead, MessageReaction, Notification  # noqa: F401

__all__ = [
    "Base",
    # Utilisateurs
    "Profile", "ParentStudentLink",
    "StudentProfile", "TutorProfile",
    "CanopProfile", "ExternalYoungProfile",
    # Sessions
    "Session", "Availability",
    # Paiements
    "Payment", "EscrowTransaction",
    # CANOPE/COSP
    "Assessment", "Resource", "Review",
    # Messagerie
    "Conversation", "ConversationParticipant", "Message",
    "MessageRead", "MessageReaction", "Notification",
]
