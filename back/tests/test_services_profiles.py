"""
Tests unitaires — service profils (src/services/profiles.py).
DB mockée via MagicMock — aucune connexion réelle.
"""

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from src.models.enums import UserRole
from tests.conftest import make_profile


# ── Helpers ────────────────────────────────────────────────────────────────

def make_student_profile(profile_id=None):
    """Crée un sous-profil élève léger."""
    return SimpleNamespace(
        id              = uuid.uuid4(),
        profile_id      = profile_id or uuid.uuid4(),
        grade_level     = "Terminale",
        school_name     = "Lycée test",
        serie           = "S",
        subjects_needed = ["Maths", "Physique"],
        location        = "Antananarivo",
        vak_dominant    = "V",
        riasec_code     = "RI",
        disc_profile    = "D",
    )


def make_tutor_profile(profile_id=None):
    """Crée un sous-profil tuteur léger."""
    return SimpleNamespace(
        id                = uuid.uuid4(),
        profile_id        = profile_id or uuid.uuid4(),
        validation_status = SimpleNamespace(value="validated"),
        bio               = "Bio test",
        subjects          = ["Maths"],
        grade_levels      = ["Terminale"],
        hourly_rate       = 15000,
        teaching_methods  = ["présentiel"],
        location          = "Antananarivo",
        avg_rating        = 4.5,
        total_sessions    = 10,
        canope_certified  = True,
        kyc_verified      = True,
        wallet_balance    = 50000,
        slug              = "tuteur-test",
        created_at        = datetime.now(timezone.utc),
    )


def make_full_profile(role: UserRole):
    """Crée un profil avec tous les champs requis par get_full_profile."""
    return SimpleNamespace(
        id                 = uuid.uuid4(),
        email              = f"{role.value}@test.miabo.mg",
        full_name          = f"Test {role.value.capitalize()}",
        role               = role,
        phone              = "+261340000000",
        avatar_url         = None,
        preferred_language = "fr",
        is_active          = True,
        created_at         = datetime.now(timezone.utc),
    )


# ── get_full_profile ───────────────────────────────────────────────────────

def test_get_full_profile_base():
    """Profil parent → pas de sous-profil métier."""
    from src.services.profiles import get_full_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.parent)

    result = get_full_profile(db, profile)

    assert result["email"]          == profile.email
    assert result["role"]           == "parent"
    assert result["student_profile"] is None
    assert result["tutor_profile"]   is None


def test_get_full_profile_student_avec_sous_profil():
    """Profil élève → student_profile renseigné."""
    from src.services.profiles import get_full_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.student)
    sp      = make_student_profile(profile_id=profile.id)

    db.query.return_value.filter.return_value.first.return_value = sp

    result = get_full_profile(db, profile)

    assert result["student_profile"] is not None
    assert result["student_profile"]["grade_level"] == "Terminale"
    assert result["tutor_profile"] is None


def test_get_full_profile_tutor_avec_sous_profil():
    """Profil tuteur → tutor_profile renseigné."""
    from src.services.profiles import get_full_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.tutor)
    tp      = make_tutor_profile(profile_id=profile.id)

    db.query.return_value.filter.return_value.first.return_value = tp

    result = get_full_profile(db, profile)

    assert result["tutor_profile"] is not None
    assert result["tutor_profile"]["hourly_rate"] == 15000
    assert result["student_profile"] is None


# ── update_basic_profile ───────────────────────────────────────────────────

def test_update_basic_profile_full_name():
    """Mise à jour du full_name uniquement."""
    from src.services.profiles import update_basic_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.student)

    result = update_basic_profile(db, profile, full_name="Nouveau Nom",
                                  phone=None, avatar_url=None, locale=None)

    assert result.full_name == "Nouveau Nom"
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(profile)


def test_update_basic_profile_locale_valide():
    """Locale 'mg' acceptée."""
    from src.services.profiles import update_basic_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.student)

    update_basic_profile(db, profile, full_name=None, phone=None,
                         avatar_url=None, locale="mg")

    assert profile.preferred_language == "mg"


def test_update_basic_profile_locale_invalide():
    """Locale inconnue ignorée (pas de modification)."""
    from src.services.profiles import update_basic_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.student)
    profile.preferred_language = "fr"

    update_basic_profile(db, profile, full_name=None, phone=None,
                         avatar_url=None, locale="en")

    assert profile.preferred_language == "fr"


# ── update_tutor_profile ───────────────────────────────────────────────────

def test_update_tutor_profile_ok():
    """Mise à jour du sous-profil tuteur."""
    from src.services.profiles import update_tutor_profile, get_full_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.tutor)
    tp      = make_tutor_profile(profile_id=profile.id)

    # Premier appel : récupérer TutorProfile
    db.query.return_value.filter.return_value.first.return_value = tp

    with patch("src.services.profiles.get_full_profile") as mock_get:
        mock_get.return_value = {"tutor_profile": {"bio": "Nouvelle bio"}}
        result = update_tutor_profile(db, profile, bio="Nouvelle bio")

    assert tp.bio == "Nouvelle bio"
    db.commit.assert_called_once()


def test_update_tutor_profile_introuvable():
    """TutorProfile inexistant → 404."""
    from src.services.profiles import update_tutor_profile

    db      = MagicMock()
    profile = make_full_profile(UserRole.tutor)

    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        update_tutor_profile(db, profile, bio="Bio")

    assert exc.value.status_code == 404
