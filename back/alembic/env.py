"""
Alembic env.py — Configuration de l'environnement de migration.
Charge DATABASE_URL depuis .env et enregistre tous les modèles
pour permettre l'autogenerate (alembic revision --autogenerate).
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# Ajout du dossier back/ au path Python pour les imports relatifs
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Chargement des variables d'environnement depuis .env
load_dotenv()

# Objet de configuration Alembic (accès à alembic.ini)
config = context.config

# Injection de l'URL depuis l'environnement — jamais en clair dans alembic.ini
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError(
        "DATABASE_URL non définie. "
        "Copier env.sample vers .env et renseigner la valeur."
    )
config.set_main_option("sqlalchemy.url", database_url)

# Configuration du logging depuis alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import de Base + tous les modèles pour l'autogenerate Alembic
# IMPORTANT : cet import doit rester après sys.path.insert
from src.models import Base  # noqa: E402

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Mode offline : génère le SQL sans connexion active.
    Utile pour audit ou environnements sans accès direct à la BDD.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Compare les types de colonnes lors de l'autogenerate
        compare_type=True,
        # Compare les valeurs server_default
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Mode online : connexion active à Supabase PostgreSQL.
    Utilisé par `alembic upgrade head` en développement et CI/CD.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # Pas de pool pour les migrations
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            # Inclure les schémas Supabase Auth dans la détection
            include_schemas=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# Point d'entrée : offline si pas de connexion active, online sinon
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
