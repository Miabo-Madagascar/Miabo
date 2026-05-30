"""disc_dominant : code multi-lettres (1-4) basé sur seuil 40 %

Revision ID: 0007
Revises: 0006
Create Date: 2026-05-30
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # 1. Supprime l'ancienne contrainte stricte avant de modifier les données
    op.drop_constraint("chk_disc", "assessments", type_="check")

    # 2. Recalcule disc_dominant depuis disc_scores (seuil 40 % du score dominant)
    conn.execute(sa.text("""
        UPDATE assessments
        SET disc_dominant = (
            SELECT string_agg(key, '' ORDER BY val::float DESC)
            FROM jsonb_each_text(disc_scores) AS t(key, val)
            WHERE val::float >= 0.4 * (
                SELECT max(v::float)
                FROM jsonb_each_text(disc_scores) AS t2(key2, v)
            )
        )
        WHERE disc_scores IS NOT NULL
          AND disc_dominant IS NOT NULL
    """))

    # 3. Ajoute la nouvelle contrainte souple (1 à 4 lettres)
    op.create_check_constraint(
        "chk_disc", "assessments",
        "char_length(disc_dominant) BETWEEN 1 AND 4"
    )


def downgrade() -> None:
    op.drop_constraint("chk_disc", "assessments", type_="check")
    op.create_check_constraint(
        "chk_disc", "assessments",
        "disc_dominant IN ('D','I','S','C')"
    )
