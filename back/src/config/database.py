"""
Configuration SQLAlchemy — connexion Supabase via PgBouncer (port 6543).
PgBouncer Transaction mode impose de désactiver les prepared statements.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # Désactive le cache de prepared statements — obligatoire avec PgBouncer
    connect_args={"prepare_threshold": None},
    # Pas de pool côté SQLAlchemy car PgBouncer gère déjà le pooling
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Fournit une session SQLAlchemy par requête (utilisé par src/dependencies.py)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
