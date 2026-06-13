"""auto-bilan élève : administered_by nullable + statut pending_validation

Revision ID: 0008
Revises: 0007
Create Date: 2026-06-13
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # L'élève peut désormais créer un bilan sans conseiller CANOPE/COSP
    op.alter_column("assessments", "administered_by",
                     existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
                     nullable=True)

    # Nouveau statut : auto-bilan terminé, en attente de relecture CANOPE/COSP
    op.execute("ALTER TYPE assessment_status ADD VALUE IF NOT EXISTS 'pending_validation'")


def downgrade() -> None:
    # PostgreSQL ne permet pas de retirer une valeur d'ENUM facilement —
    # les lignes 'pending_validation' doivent être migrées manuellement avant downgrade.
    op.alter_column("assessments", "administered_by",
                     existing_type=sa.dialects.postgresql.UUID(as_uuid=True),
                     nullable=False)
