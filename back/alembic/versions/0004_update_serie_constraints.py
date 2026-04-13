"""Mise à jour des contraintes de série — ajout A1, A2, OSE, C, D, L

Revision ID: 0004_update_serie_constraints
Revises: cade5942a157
Create Date: 2026-04-13
"""

from alembic import op

revision = "0004_update_serie_constraints"
down_revision = "cade5942a157"
branch_labels = None
depends_on = None

# Séries valides après migration
_SERIES_CHECK = "serie IN ('A1', 'A2', 'S', 'OSE', 'C', 'D', 'L')"


def upgrade() -> None:
    # ── Table assessments ────────────────────────────────────────────────────
    op.drop_constraint("chk_serie_assess", "assessments", type_="check")
    op.create_check_constraint("chk_serie_assess", "assessments", _SERIES_CHECK)

    # ── Table external_young_profiles ────────────────────────────────────────
    op.drop_constraint("chk_external_serie", "external_young_profiles", type_="check")
    op.create_check_constraint("chk_external_serie", "external_young_profiles", _SERIES_CHECK)


def downgrade() -> None:
    _SERIES_OLD = "serie IN ('L', 'S')"

    op.drop_constraint("chk_serie_assess", "assessments", type_="check")
    op.create_check_constraint("chk_serie_assess", "assessments", _SERIES_OLD)

    op.drop_constraint("chk_external_serie", "external_young_profiles", type_="check")
    op.create_check_constraint("chk_external_serie", "external_young_profiles", _SERIES_OLD)
