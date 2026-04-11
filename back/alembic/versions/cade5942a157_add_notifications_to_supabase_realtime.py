"""add notifications to supabase_realtime

Revision ID: cade5942a157
Revises: 9956dbbc78c9
Create Date: 2026-04-07 19:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cade5942a157'
down_revision: Union[str, None] = '9956dbbc78c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Création de la publication supabase_realtime si elle n'existe pas
    op.execute(
        "DO $$ "
        "BEGIN "
        "  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN "
        "    CREATE PUBLICATION supabase_realtime; "
        "  END IF; "
        "END $$;"
    )
    # Ajout de la table notifications à la publication pour le realtime
    op.execute(
        "DO $$ "
        "BEGIN "
        "  BEGIN "
        "    ALTER PUBLICATION supabase_realtime ADD TABLE notifications; "
        "  EXCEPTION WHEN duplicate_object THEN "
        "    NULL; "
        "  END; "
        "END $$;"
    )


def downgrade() -> None:
    op.execute(
        "DO $$ "
        "BEGIN "
        "  BEGIN "
        "    ALTER PUBLICATION supabase_realtime DROP TABLE notifications; "
        "  EXCEPTION WHEN undefined_object THEN "
        "    NULL; "
        "  END; "
        "END $$;"
    )
