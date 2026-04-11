# src/ — FastAPI backend

Code source de l'API Python.

## Structure

```
src/
├── models/             # SQLAlchemy ORM — source de vérité pour Alembic
│   ├── base.py         # DeclarativeBase partagée
│   ├── enums.py        # Enums Python (miroir des ENUM PostgreSQL)
│   ├── users.py        # Profile, ParentStudentLink
│   ├── profiles.py     # StudentProfile, TutorProfile
│   ├── canope_users.py # CanopProfile, ExternalYoungProfile
│   ├── sessions.py     # Session, Availability
│   ├── payments.py     # Payment, EscrowTransaction
│   ├── canope.py       # Assessment, Resource, Review
│   ├── messaging.py    # Conversation, Message, ConversationParticipant
│   ├── notifications.py# MessageRead, MessageReaction, Notification
│   └── __init__.py     # Import all → détection Alembic autogenerate
├── routers/            # APIRouter par domaine
│   ├── auth.py
│   ├── sessions.py
│   ├── payments.py
│   ├── matching.py
│   ├── messages.py
│   ├── assessments.py
│   ├── resources.py
│   └── admin.py
├── schemas/            # Pydantic v2 — validation requêtes/réponses
├── services/           # Logique métier (escrow, matching, notifications)
├── dependencies.py     # get_db(), get_current_user(), require_role()
├── database.py         # Engine SQLAlchemy + SessionLocal
└── main.py             # FastAPI app, CORS, routers, lifespan
```

## Commandes Alembic

```bash
cd back
alembic upgrade head          # Appliquer toutes les migrations
alembic revision --autogenerate -m "description"
alembic downgrade -1          # Revenir d'une révision
```
