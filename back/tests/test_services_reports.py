"""
Tests unitaires — service rapports PDF (src/services/reports.py).
DB mockée via MagicMock — vérifie le contenu des bytes PDF et les accès.
"""

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from src.models.enums import UserRole, AssessmentStatus
from tests.conftest import make_profile


# ── Helpers ────────────────────────────────────────────────────────────────

def make_assessment(administered_by=None):
    """Crée un bilan validé complet."""
    return SimpleNamespace(
        id                 = uuid.uuid4(),
        administered_by    = administered_by or uuid.uuid4(),
        student_profile_id = uuid.uuid4(),
        external_young_id  = None,
        serie              = "S",
        career_interest    = "Sciences",
        vak_v_score        = 8,
        vak_a_score        = 5,
        vak_k_score        = 7,
        vak_dominant       = "V",
        riasec_scores      = {"R": 3, "I": 7, "A": 2, "S": 5, "E": 4, "C": 6},
        riasec_code        = "IC",
        disc_scores        = {"D": 6, "I": 3, "S": 5, "C": 8},
        disc_dominant      = "C",
        actor_comment      = "Élève très analytique",
        status             = AssessmentStatus.validated,
        created_at         = datetime.now(timezone.utc),
        validated_at       = datetime.now(timezone.utc),
    )


def make_canope_profile(profile_id=None):
    """Crée un profil CANOPE léger."""
    return SimpleNamespace(
        id         = uuid.uuid4(),
        profile_id = profile_id or uuid.uuid4(),
    )


# ── _build_report_data ────────────────────────────────────────────────────

def test_build_report_data_complete():
    """build_report_data retourne tous les champs attendus."""
    from src.services.reports import _build_report_data

    a    = make_assessment()
    data = _build_report_data(a)

    assert data["vak_dominant"]   == "V"
    assert data["riasec_code"]    == "IC"
    assert data["disc_dominant"]  == "C"
    assert "Visuel" in data["vak_description"]
    assert "Investigateur" in data["riasec_description"]
    assert "Consciencieux" in data["disc_description"]


def test_build_report_data_sans_scores():
    """Valeurs absentes → champs à '—'."""
    from src.services.reports import _build_report_data

    a = make_assessment()
    a.vak_dominant  = None
    a.riasec_code   = None
    a.disc_dominant = None
    a.validated_at  = None
    a.actor_comment = None

    data = _build_report_data(a)

    assert data["vak_dominant"]  == "—"
    assert data["riasec_code"]   == "—"
    assert data["disc_dominant"] == "—"
    assert data["validated_at"]  == "—"
    assert data["actor_comment"] == "—"


# ── _minimal_pdf ──────────────────────────────────────────────────────────

def test_minimal_pdf_retourne_bytes_pdf():
    """_minimal_pdf retourne des bytes commençant par %PDF."""
    from src.services.reports import _minimal_pdf, _build_report_data

    a    = make_assessment()
    data = _build_report_data(a)
    pdf  = _minimal_pdf(data)

    assert isinstance(pdf, bytes)
    assert pdf.startswith(b"%PDF")
    assert b"%%EOF" in pdf


def test_minimal_pdf_non_vide():
    """Le PDF généré a une taille raisonnable (> 500 bytes)."""
    from src.services.reports import _minimal_pdf, _build_report_data

    a    = make_assessment()
    data = _build_report_data(a)
    pdf  = _minimal_pdf(data)

    assert len(pdf) > 500


# ── generate_assessment_pdf ───────────────────────────────────────────────

def test_generate_pdf_canope_autorise():
    """Acteur CANOPE propriétaire → PDF généré sans erreur."""
    from src.services.reports import generate_assessment_pdf

    db      = MagicMock()
    user    = make_profile(UserRole.canope)
    cp      = make_canope_profile(profile_id=user.id)
    a       = make_assessment(administered_by=cp.id)

    # Récupération du CanopProfile
    first_call  = MagicMock()
    first_call.first.return_value = cp
    # Récupération de l'Assessment
    second_call = MagicMock()
    second_call.first.return_value = a

    calls = [first_call, second_call]
    db.query.return_value.filter.side_effect = calls

    pdf = generate_assessment_pdf(db, str(a.id), user)

    assert isinstance(pdf, bytes)
    assert len(pdf) > 0


def test_generate_pdf_admin_autorise():
    """Admin → accès direct sans passer par CanopProfile."""
    from src.services.reports import generate_assessment_pdf

    db   = MagicMock()
    user = make_profile(UserRole.admin)
    a    = make_assessment()

    db.query.return_value.filter.return_value.first.return_value = a

    pdf = generate_assessment_pdf(db, str(a.id), user)

    assert isinstance(pdf, bytes)


def test_generate_pdf_student_refuse():
    """Élève → 403 Forbidden."""
    from src.services.reports import generate_assessment_pdf

    db   = MagicMock()
    user = make_profile(UserRole.student)

    with pytest.raises(HTTPException) as exc:
        generate_assessment_pdf(db, str(uuid.uuid4()), user)

    assert exc.value.status_code == 403


def test_generate_pdf_bilan_introuvable():
    """Admin demande un bilan inexistant → 404."""
    from src.services.reports import generate_assessment_pdf

    db   = MagicMock()
    user = make_profile(UserRole.admin)
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        generate_assessment_pdf(db, str(uuid.uuid4()), user)

    assert exc.value.status_code == 404
