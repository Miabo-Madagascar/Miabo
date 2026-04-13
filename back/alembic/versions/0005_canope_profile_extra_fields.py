"""Ajout champs profil CANOPE : address, profile_type, profile_other

Revision ID: 0005_canope_profile_extra_fields
Revises: 0004_update_serie_constraints
Create Date: 2026-04-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_canope_profile_extra_fields"
down_revision = "0004_update_serie_constraints"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("canope_profiles", sa.Column("address",       sa.Text(), nullable=True))
    op.add_column("canope_profiles", sa.Column("profile_type",  sa.Text(), nullable=True))
    op.add_column("canope_profiles", sa.Column("profile_other", sa.Text(), nullable=True))

    op.create_check_constraint(
        "chk_canope_profile_type",
        "canope_profiles",
        "profile_type IS NULL OR profile_type IN ('etudiant', 'tuteur', 'parent', 'autre')",
    )


def downgrade() -> None:
    op.drop_constraint("chk_canope_profile_type", "canope_profiles", type_="check")
    op.drop_column("canope_profiles", "profile_other")
    op.drop_column("canope_profiles", "profile_type")
    op.drop_column("canope_profiles", "address")
