"""Trigger auth.users → profiles + sous-profils automatiques

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-05 00:00:00

Logique :
  Quand Supabase Auth insère un utilisateur dans auth.users,
  ce trigger crée automatiquement :
    1. La ligne dans public.profiles
    2. Le sous-profil métier (student_profiles ou tutor_profiles)
  selon le rôle stocké dans raw_user_meta_data lors du signUp().

  Cela fonctionne que l'email soit confirmé ou non, car auth.users
  est peuplé dès l'inscription. Le sous-profil sera présent dès
  la première connexion de l'utilisateur.
"""

from typing import Sequence, Union
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ── Fonction trigger ───────────────────────────────────────────────────────

_CREATE_FUNCTION = """
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role      TEXT;
  v_full_name TEXT;
  v_locale    TEXT;
BEGIN
  -- Lecture des métadonnées envoyées par supabase.auth.signUp({ data: {...} })
  v_role      := COALESCE(NEW.raw_user_meta_data->>'role',      'student');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_locale    := COALESCE(NEW.raw_user_meta_data->>'locale',    'fr');

  -- Validation du rôle : seuls student, tutor, parent autorisés à l'auto-inscription
  IF v_role NOT IN ('student', 'tutor', 'parent') THEN
    v_role := 'student';
  END IF;

  -- Création du profil de base (idempotent via ON CONFLICT)
  INSERT INTO public.profiles (id, email, full_name, role, preferred_language, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role::public.user_role,
    CASE WHEN v_locale IN ('fr', 'mg') THEN v_locale ELSE 'fr' END,
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  -- Création du sous-profil métier selon le rôle
  IF v_role = 'student' THEN
    INSERT INTO public.student_profiles (id, profile_id, grade_level, subjects_needed)
    VALUES (gen_random_uuid(), NEW.id, '6eme', '{}')
    ON CONFLICT DO NOTHING;

  ELSIF v_role = 'tutor' THEN
    INSERT INTO public.tutor_profiles (
      id, profile_id, hourly_rate, subjects, grade_levels, teaching_methods
    )
    VALUES (gen_random_uuid(), NEW.id, 5000, '{}', '{}', '{}')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
"""

_CREATE_TRIGGER = """
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
"""

_DROP_TRIGGER   = "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;"
_DROP_FUNCTION  = "DROP FUNCTION IF EXISTS public.handle_new_user();"


def upgrade() -> None:
    op.execute(_CREATE_FUNCTION)
    op.execute(_CREATE_TRIGGER)


def downgrade() -> None:
    op.execute(_DROP_TRIGGER)
    op.execute(_DROP_FUNCTION)
