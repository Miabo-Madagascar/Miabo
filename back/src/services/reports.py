"""
Service rapports — génération PDF des bilans d'orientation.

Stratégie de génération PDF :
- Template HTML via Jinja2 (déjà dans le venv)
- Conversion HTML → PDF via la librairie `fpdf2` si disponible,
  sinon fallback vers un PDF minimal généré en Python pur.

En production, installer fpdf2 :
  pip install fpdf2==2.8.*
"""

import io
import textwrap
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session as DbSession

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
    # Admin : accès total
    if user.role == UserRole.admin:
        a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Bilan introuvable")
        return a

    # Acteur CANOPE/COSP : ses propres bilans
    if user.role in (UserRole.canope, UserRole.cosp):
        cp = db.query(CanopProfile).filter(
            CanopProfile.profile_id == user.id
        ).first()
        if not cp:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Profil CANOPE/COSP introuvable")
        a = db.query(Assessment).filter(
            Assessment.id == assessment_id,
            Assessment.administered_by == cp.id,
        ).first()
        if not a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Bilan introuvable ou non autorisé")
        return a

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                        detail="Accès réservé aux acteurs CANOPE/COSP et Admin")


# ── Génération du contenu PDF ─────────────────────────────────────────────────

def _vak_description(dominant: str | None) -> str:
    """Texte explicatif du profil VAK dominant."""
    descriptions = {
        "V": "Visuel — apprentissage par images, schémas et supports visuels.",
        "A": "Auditif — apprentissage par écoute, discussions et explications orales.",
        "K": "Kinesthésique — apprentissage par l'action, la pratique et l'expérience.",
    }
    return descriptions.get(dominant or "", "Non déterminé")


def _riasec_description(code: str | None) -> str:
    """Texte explicatif du code RIASEC."""
    letters = {
        "R": "Réaliste",
        "I": "Investigateur",
        "A": "Artistique",
        "S": "Social",
        "E": "Entrepreneur",
        "C": "Conventionnel",
    }
    if not code:
        return "Non déterminé"
    return " + ".join(letters.get(c, c) for c in code)


def _disc_description(dominant: str | None) -> str:
    """Texte explicatif du profil DISC dominant."""
    descriptions = {
        "D": "Dominant — orienté résultats, décisif et compétitif.",
        "I": "Influent — communicatif, enthousiaste et persuasif.",
        "S": "Stable — loyal, patient et orienté équipe.",
        "C": "Consciencieux — analytique, méticuleux et orienté qualité.",
    }
    return descriptions.get(dominant or "", "Non déterminé")


def _build_report_data(a: Assessment) -> dict[str, Any]:
    """Construit le dictionnaire de données pour le rapport."""
    return {
        "assessment_id":    str(a.id),
        "generated_at":     datetime.now(timezone.utc).strftime("%d/%m/%Y à %H:%M UTC"),
        "status":           a.status.value,
        "serie":            a.serie or "—",
        "career_interest":  a.career_interest or "—",
        "actor_comment":    a.actor_comment or "—",
        "validated_at":     a.validated_at.strftime("%d/%m/%Y") if a.validated_at else "—",
        # VAK
        "vak_v_score":      a.vak_v_score,
        "vak_a_score":      a.vak_a_score,
        "vak_k_score":      a.vak_k_score,
        "vak_dominant":     a.vak_dominant or "—",
        "vak_description":  _vak_description(a.vak_dominant),
        # RIASEC
        "riasec_scores":    a.riasec_scores or {},
        "riasec_code":      a.riasec_code or "—",
        "riasec_description": _riasec_description(a.riasec_code),
        # DISC
        "disc_scores":      a.disc_scores or {},
        "disc_dominant":    a.disc_dominant or "—",
        "disc_description": _disc_description(a.disc_dominant),
    }


# ── Génération PDF minimal (Python pur) ──────────────────────────────────────

def _minimal_pdf(data: dict[str, Any]) -> bytes:
    """
    Génère un PDF minimal en Python pur.
    Format : texte structuré encodé en PDF 1.4 (ASCII safe).
    Utilisé en fallback si fpdf2 n'est pas installé.
    """
    lines = [
        "RAPPORT DE BILAN D'ORIENTATION — MIABO",
        "=" * 50,
        f"ID bilan         : {data['assessment_id']}",
        f"Statut           : {data['status']}",
        f"Généré le        : {data['generated_at']}",
        f"Validé le        : {data['validated_at']}",
        f"Série            : {data['serie']}",
        f"Intérêt           : {data['career_interest']}",
        "",
        "── PROFIL VAK ──────────────────────────────────",
        f"Score V (Visuel)     : {data['vak_v_score']}",
        f"Score A (Auditif)    : {data['vak_a_score']}",
        f"Score K (Kinesth.)   : {data['vak_k_score']}",
        f"Profil dominant      : {data['vak_dominant']}",
        f"Interprétation       : {data['vak_description']}",
        "",
        "── PROFIL RIASEC ────────────────────────────────",
    ]

    for letter, score in (data["riasec_scores"] or {}).items():
        lines.append(f"  {letter} : {score}")
    lines += [
        f"Code 2 lettres   : {data['riasec_code']}",
        f"Interprétation   : {data['riasec_description']}",
        "",
        "── PROFIL DISC ──────────────────────────────────",
    ]

    for letter, score in (data["disc_scores"] or {}).items():
        lines.append(f"  {letter} : {score}")
    lines += [
        f"Profil dominant  : {data['disc_dominant']}",
        f"Interprétation   : {data['disc_description']}",
        "",
        "── COMMENTAIRE DE L'ACTEUR ──────────────────────",
    ]
    lines.extend(textwrap.wrap(data["actor_comment"], width=60) or ["—"])
    lines += ["", "=" * 50, "Document généré par MIABO — plateforme de tutorat Madagascar"]

    # Encodage PDF minimal valide
    content = "\n".join(lines)
    content_bytes = content.encode("latin-1", errors="replace")

    # Structure PDF 1.4 minimale
    objects: list[bytes] = []
    offsets: list[int] = []

    def obj(n: int, data_str: str) -> bytes:
        return f"{n} 0 obj\n{data_str}\nendobj\n".encode("latin-1")

    stream = (
        f"BT\n/F1 10 Tf\n"
        + "".join(
            f"50 {750 - i * 14} Td ({ln.replace('(', r'\(').replace(')', r'\)')}) Tj\n"
            if i == 0 else
            f"0 -14 Td ({ln.replace('(', r'\\(').replace(')', r'\\)')}) Tj\n"
            for i, ln in enumerate(lines[:50])  # max 50 lignes / page
        )
        + "ET"
    )

    stream_bytes = stream.encode("latin-1", errors="replace")
    length = len(stream_bytes)

    buf = io.BytesIO()
    buf.write(b"%PDF-1.4\n")

    # Objet 1 : catalog
    offsets.append(buf.tell())
    buf.write(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

    # Objet 2 : pages
    offsets.append(buf.tell())
    buf.write(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")

    # Objet 3 : page
    offsets.append(buf.tell())
    buf.write(b"3 0 obj\n<< /Type /Page /Parent 2 0 R "
              b"/MediaBox [0 0 595 842] "
              b"/Resources << /Font << /F1 4 0 R >> >> "
              b"/Contents 5 0 R >>\nendobj\n")

    # Objet 4 : font
    offsets.append(buf.tell())
    buf.write(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n")

    # Objet 5 : stream
    offsets.append(buf.tell())
    buf.write(f"5 0 obj\n<< /Length {length} >>\nstream\n".encode("latin-1"))
    buf.write(stream_bytes)
    buf.write(b"\nendstream\nendobj\n")

    # Cross-reference table
    xref_offset = buf.tell()
    buf.write(b"xref\n")
    buf.write(f"0 {len(offsets) + 1}\n".encode())
    buf.write(b"0000000000 65535 f \n")
    for off in offsets:
        buf.write(f"{off:010d} 00000 n \n".encode())

    buf.write(f"trailer\n<< /Size {len(offsets) + 1} /Root 1 0 R >>\n".encode())
    buf.write(f"startxref\n{xref_offset}\n%%EOF\n".encode())

    return buf.getvalue()


# ── Entrée publique ───────────────────────────────────────────────────────────

def generate_assessment_pdf(
    db:            DbSession,
    assessment_id: str,
    user:          Profile,
) -> bytes:
    """
    Génère le PDF du bilan d'orientation.
    Retourne les bytes du fichier PDF.
    """
    a    = _get_assessment_for_report(db, assessment_id, user)
    data = _build_report_data(a)

    # Tentative d'utiliser fpdf2 si disponible (meilleur rendu)
    try:
        return _pdf_with_fpdf2(data)
    except ImportError:
        return _minimal_pdf(data)


def _pdf_with_fpdf2(data: dict[str, Any]) -> bytes:
    """
    Génère le PDF avec fpdf2 (pip install fpdf2).
    Lève ImportError si la librairie n'est pas installée.
    """
    from fpdf import FPDF  # type: ignore[import]

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # En-tête
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "BILAN D'ORIENTATION — MIABO", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, f"Généré le {data['generated_at']}", ln=True, align="C")
    pdf.ln(4)

    def section(title: str) -> None:
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_fill_color(230, 230, 230)
        pdf.cell(0, 8, title, ln=True, fill=True)
        pdf.set_font("Helvetica", "", 10)

    def row(label: str, value: str) -> None:
        pdf.cell(70, 6, label, border=0)
        pdf.cell(0, 6, str(value), ln=True)

    # Informations générales
    section("Informations générales")
    row("ID bilan", data["assessment_id"][:18] + "...")
    row("Statut", data["status"])
    row("Validé le", data["validated_at"])
    row("Série", data["serie"])
    row("Intérêt", data["career_interest"])
    pdf.ln(3)

    # VAK
    section("Profil VAK")
    row("Score V (Visuel)", str(data["vak_v_score"]))
    row("Score A (Auditif)", str(data["vak_a_score"]))
    row("Score K (Kinesthésique)", str(data["vak_k_score"]))
    row("Profil dominant", data["vak_dominant"])
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5, data["vak_description"])
    pdf.ln(3)

    # RIASEC
    section("Profil RIASEC")
    for letter, score in (data["riasec_scores"] or {}).items():
        row(f"  {letter}", str(score))
    row("Code 2 lettres", data["riasec_code"])
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5, data["riasec_description"])
    pdf.ln(3)

    # DISC
    section("Profil DISC")
    for letter, score in (data["disc_scores"] or {}).items():
        row(f"  {letter}", str(score))
    row("Profil dominant", data["disc_dominant"])
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5, data["disc_description"])
    pdf.ln(3)

    # Commentaire
    section("Commentaire de l'acteur CANOPE/COSP")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, data["actor_comment"])

    # Pied de page
    pdf.ln(5)
    pdf.set_font("Helvetica", "I", 8)
    pdf.cell(0, 5, "Document généré par MIABO — plateforme de tutorat Madagascar", align="C")

    return bytes(pdf.output())
