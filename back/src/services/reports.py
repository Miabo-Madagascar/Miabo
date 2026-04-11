"""
Service rapports — génération PDF des bilans d'orientation.

Stratégie de génération PDF :
- Template HTML via Jinja2
- Conversion HTML → PDF via la librairie `weasyprint` si disponible,
  sinon fallback vers un texte brut.

En production, installer weasyprint :
  pip install weasyprint
"""

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session as DbSession
from jinja2 import Environment, FileSystemLoader

from src.models.users import Profile
from src.models.canope import Assessment
from src.models.canope_users import CanopProfile
from src.models.enums import UserRole


# ── Accès BDD ─────────────────────────────────────────────────────────────────

def _get_assessment_for_report(
    db: DbSession,
    assessment_id: str,
    user: Profile,
) -> Assessment:
    """Retourne le bilan si l'utilisateur y est autorisé."""
    if user.role == UserRole.admin:
        a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    elif user.role in (UserRole.canope, UserRole.cosp):
        cp = db.query(CanopProfile).filter(CanopProfile.profile_id == user.id).first()
        if not cp:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Profil CANOPE/COSP introuvable")
        a = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.administered_by == cp.id).first()
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès réservé")

    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bilan introuvable")
    return a


# ── Helpers descriptions ───────────────────────────────────────────────────────

def _vak_description(dominant: str | None) -> str:
    return {
        "V": "Visuel — apprentissage par images et schémas.",
        "A": "Auditif — apprentissage par écoute et discussions.",
        "K": "Kinesthésique — apprentissage par l'action et la pratique.",
    }.get(dominant or "", "Non déterminé")

def _riasec_description(code: str | None) -> str:
    letters = {"R": "Réaliste", "I": "Investigateur", "A": "Artistique", "S": "Social", "E": "Entrepreneur", "C": "Conventionnel"}
    return " + ".join(letters.get(c, c) for c in (code or ""))

def _disc_description(dominant: str | None) -> str:
    return {
        "D": "Dominant — orienté résultats et décision.",
        "I": "Influent — communiquant et enthousiaste.",
        "S": "Stable — loyal et orienté équipe.",
        "C": "Consciencieux — analytique et méticuleux.",
    }.get(dominant or "", "Non déterminé")


# ── Génération PDF ────────────────────────────────────────────────────────────

def generate_assessment_pdf(
    db:            DbSession,
    assessment_id: str,
    user:          Profile,
) -> bytes:
    """Génère le PDF du bilan via WeasyPrint."""
    a    = _get_assessment_for_report(db, assessment_id, user)
    data = {
        "assessment_id":    str(a.id),
        "generated_at":     datetime.now(timezone.utc).strftime("%d/%m/%Y à %H:%M"),
        "status":           a.status.value,
        "serie":            a.serie or "—",
        "career_interest":  a.career_interest or "—",
        "actor_comment":    a.actor_comment or "—",
        "validated_at":     a.validated_at.strftime("%d/%m/%Y") if a.validated_at else "—",
        "vak_v_score":      a.vak_v_score,
        "vak_a_score":      a.vak_a_score,
        "vak_k_score":      a.vak_k_score,
        "vak_dominant":     a.vak_dominant or "—",
        "vak_description":  _vak_description(a.vak_dominant),
        "riasec_scores":    a.riasec_scores or {},
        "riasec_code":      a.riasec_code or "—",
        "riasec_description": _riasec_description(a.riasec_code),
        "disc_scores":      a.disc_scores or {},
        "disc_dominant":    a.disc_dominant or "—",
        "disc_description": _disc_description(a.disc_dominant),
        "year":             datetime.now().year,
    }

    try:
        from weasyprint import HTML # type: ignore
        template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template("report.html")
        html_out = template.render(data)
        
        pdf_bytes = HTML(string=html_out).write_pdf()
        return pdf_bytes
    except Exception as e:
        # Fallback simple
        return f"Rapport de Bilan d'Orientation - MIABO\n\nID: {data['assessment_id']}\nVAK: {data['vak_dominant']}\nRIASEC: {data['riasec_code']}\nDISC: {data['disc_dominant']}\nCommentaire: {data['actor_comment']}".encode("utf-8")
