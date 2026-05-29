"""fix vak score range (0-50) and riasec code length (3)

Revision ID: 0006_fix_vak_and_riasec_constraints
Revises: cade5942a157
Create Date: 2026-05-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0006"
down_revision: Union[str, Sequence[str], None] = ("0005_canope_profile_extra_fields", "cade5942a157")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # VAK : 10 questions × 5 pts max = 50, pas 20
    op.drop_constraint("chk_vak_v", "assessments", type_="check")
    op.drop_constraint("chk_vak_a", "assessments", type_="check")
    op.drop_constraint("chk_vak_k", "assessments", type_="check")
    op.create_check_constraint("chk_vak_v", "assessments", "vak_v_score BETWEEN 0 AND 50")
    op.create_check_constraint("chk_vak_a", "assessments", "vak_a_score BETWEEN 0 AND 50")
    op.create_check_constraint("chk_vak_k", "assessments", "vak_k_score BETWEEN 0 AND 50")

    # RIASEC : convertit les codes à 2 lettres en 3 lettres avant d'appliquer la contrainte
    op.drop_constraint("chk_riasec", "assessments", type_="check")
    conn.execute(sa.text("""
        UPDATE assessments
        SET riasec_code = riasec_code || (
            SELECT key
            FROM jsonb_each_text(riasec_scores) AS t(key, val)
            WHERE key NOT IN (
                substring(riasec_code, 1, 1),
                substring(riasec_code, 2, 1)
            )
            ORDER BY val::float DESC
            LIMIT 1
        )
        WHERE riasec_code IS NOT NULL
          AND char_length(riasec_code) = 2
          AND riasec_scores IS NOT NULL
    """))
    op.create_check_constraint("chk_riasec", "assessments", "char_length(riasec_code) = 3")


def downgrade() -> None:
    op.drop_constraint("chk_vak_v",    "assessments", type_="check")
    op.drop_constraint("chk_vak_a",    "assessments", type_="check")
    op.drop_constraint("chk_vak_k",    "assessments", type_="check")
    op.create_check_constraint("chk_vak_v", "assessments", "vak_v_score BETWEEN 0 AND 20")
    op.create_check_constraint("chk_vak_a", "assessments", "vak_a_score BETWEEN 0 AND 20")
    op.create_check_constraint("chk_vak_k", "assessments", "vak_k_score BETWEEN 0 AND 20")

    op.drop_constraint("chk_riasec", "assessments", type_="check")
    op.create_check_constraint("chk_riasec", "assessments", "char_length(riasec_code) = 2")
