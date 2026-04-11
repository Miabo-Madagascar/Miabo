"""add related_id to notifications

Revision ID: 9956dbbc78c9
Revises: 0003
Create Date: 2026-04-07 19:18:48.763697+00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# Identifiants de révision
revision: str = '9956dbbc78c9'
down_revision: Union[str, None] = '0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # On ajoute uniquement la colonne related_id
    op.add_column('notifications', sa.Column('related_id', sa.UUID(), nullable=True))

def downgrade() -> None:
    op.drop_column('notifications', 'related_id')
