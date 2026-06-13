"""
Enums Python — correspondent 1:1 aux types PostgreSQL ENUM.
Utilisés dans les modèles SQLAlchemy et les schémas Pydantic.
"""

import enum


class UserRole(str, enum.Enum):
    """6 rôles définis dans le CDC §1.3"""
    student = "student"   # Élève cherchant un tuteur
    tutor   = "tutor"     # Tuteur proposant des sessions
    parent  = "parent"    # Parent d'un élève mineur
    admin   = "admin"     # Administrateur plateforme
    canope  = "canope"    # Acteur CANOPE
    cosp    = "cosp"      # Acteur COSP (hérite de CANOPE)


class TutorStatus(str, enum.Enum):
    """Cycle de validation d'un profil tuteur — CDC §MATCH-002"""
    pending   = "pending"    # En attente de review Admin/CANOPE
    validated = "validated"  # Visible publiquement
    rejected  = "rejected"   # Rejeté avec motif
    suspended = "suspended"  # Suspendu par Admin


class SessionStatus(str, enum.Enum):
    """Cycle de vie d'une session — CDC §RES"""
    pending_parent = "pending_parent"  # Attente validation parent (mineur)
    pending_tutor  = "pending_tutor"   # Attente acceptation tuteur
    confirmed      = "confirmed"       # Confirmée, Jitsi Meet généré
    in_progress    = "in_progress"     # En cours
    completed      = "completed"       # Terminée, escrow programmé
    cancelled      = "cancelled"       # Annulée
    disputed       = "disputed"        # Litige ouvert (Admin requis)


class PaymentStatus(str, enum.Enum):
    """Statuts d'un paiement Mobile Money — CDC §PAY"""
    pending    = "pending"
    processing = "processing"
    completed  = "completed"
    failed     = "failed"
    refunded   = "refunded"


class EscrowStatus(str, enum.Enum):
    """Statuts d'un fonds en séquestre — CDC §PAY"""
    held     = "held"      # Bloqué (session non terminée)
    released = "released"  # Libéré vers wallet tuteur
    disputed = "disputed"  # Litige gelé
    refunded = "refunded"  # Remboursé à l'élève/parent


class AssessmentStatus(str, enum.Enum):
    """Cycle d'un bilan d'orientation — CDC §COSP"""
    draft              = "draft"
    in_progress        = "in_progress"
    pending_validation = "pending_validation"  # Auto-bilan élève terminé, à relire par CANOPE/COSP
    validated          = "validated"  # Immuable sauf Admin


class MessageType(str, enum.Enum):
    """Types de messages — CDC §MSG"""
    text   = "text"
    image  = "image"
    file   = "file"
    system = "system"


class NotificationType(str, enum.Enum):
    """Types de notifications — CDC §NOTIF"""
    session_request = "session_request"
    payment         = "payment"
    message         = "message"
    review          = "review"
    system          = "system"


class ResourceType(str, enum.Enum):
    """Types de ressources CANOPE — CDC §CANOPE"""
    pdf      = "pdf"
    video    = "video"
    audio    = "audio"
    quiz     = "quiz"
    exercise = "exercise"


class ConversationType(str, enum.Enum):
    """Types de conversations — CDC §MSG"""
    student_tutor = "student_tutor"
    parent_tutor  = "parent_tutor"


class PaymentMethod(str, enum.Enum):
    """Méthodes de paiement acceptées — CDC §PAY"""
    mvola        = "mvola"
    orange_money = "orange_money"
    wallet       = "wallet"
