"""auto-bilan élève : politiques RLS assessments (insert/update)

Revision ID: 0009
Revises: 0008
Create Date: 2026-06-13
"""
from typing import Sequence, Union
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_OLD_INSERT = "is_canope_or_cosp()"

_NEW_INSERT = """
  is_canope_or_cosp()
  OR (
    administered_by IS NULL
    AND student_profile_id IN (SELECT id FROM student_profiles WHERE profile_id = auth.uid())
  )
"""

_OLD_UPDATE = """
  (
    administered_by IN (
      SELECT id FROM canope_profiles WHERE profile_id = auth.uid()
    )
    AND status != 'validated'
  )
  OR is_admin()
"""

_NEW_UPDATE = """
  (
    administered_by IN (SELECT id FROM canope_profiles WHERE profile_id = auth.uid())
    AND status != 'validated'
  )
  OR (
    administered_by IS NULL AND status = 'pending_validation' AND is_canope_or_cosp()
  )
  OR (
    administered_by IS NULL
    AND student_profile_id IN (SELECT id FROM student_profiles WHERE profile_id = auth.uid())
    AND status NOT IN ('pending_validation', 'validated')
  )
  OR is_admin()
"""


def upgrade() -> None:
    op.execute('DROP POLICY IF EXISTS "assessments_insert" ON assessments')
    op.execute(f'CREATE POLICY "assessments_insert" ON assessments FOR INSERT WITH CHECK ({_NEW_INSERT})')

    op.execute('DROP POLICY IF EXISTS "assessments_update" ON assessments')
    op.execute(
        f'CREATE POLICY "assessments_update" ON assessments FOR UPDATE '
        f'USING ({_NEW_UPDATE}) WITH CHECK ({_NEW_UPDATE})'
    )


def downgrade() -> None:
    op.execute('DROP POLICY IF EXISTS "assessments_insert" ON assessments')
    op.execute(f'CREATE POLICY "assessments_insert" ON assessments FOR INSERT WITH CHECK ({_OLD_INSERT})')

    op.execute('DROP POLICY IF EXISTS "assessments_update" ON assessments')
    op.execute(
        f'CREATE POLICY "assessments_update" ON assessments FOR UPDATE '
        f'USING ({_OLD_UPDATE}) WITH CHECK ({_OLD_UPDATE})'
    )
