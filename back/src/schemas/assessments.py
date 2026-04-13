"""
Schémas Pydantic — Bilans d'orientation VAK/RIASEC/DISC.
"""

from pydantic import BaseModel, field_validator


class CreateAssessmentRequest(BaseModel):
    """
    Option A : student_profile_id renseigné (élève MIABO).
    Option B : external_young_id renseigné (existant) OU infos jeune externe (nouveau).
    Champs jeune externe (CDC §6) : date_of_birth, gender, region, quartier, school_name.
    """
    student_profile_id:        str | None = None
    external_young_id:         str | None = None
    external_young_full_name:  str | None = None
    date_of_birth:             str | None = None   # ISO YYYY-MM-DD
    gender:                    str | None = None   # M | F | autre
    region:                    str | None = None
    quartier:                  str | None = None
    school_name:               str | None = None
    serie:                     str | None = None
    career_interest:           str | None = None

    @field_validator("serie")
    @classmethod
    def serie_valide(cls, v: str | None) -> str | None:
        series_valides = ("A1", "A2", "S", "OSE", "C", "D", "L")
        if v and v not in series_valides:
            raise ValueError(f"Série invalide. Valeurs acceptées : {', '.join(series_valides)}")
        return v

    @field_validator("gender")
    @classmethod
    def gender_valide(cls, v: str | None) -> str | None:
        if v and v not in ("M", "F", "autre"):
            raise ValueError("Sexe invalide. Valeurs acceptées : M, F, autre")
        return v


class VakRequest(BaseModel):
    """Scores bruts VAK — limites max : V=10, A=9, K=11."""
    v_score: int
    a_score: int
    k_score: int

    @field_validator("v_score")
    @classmethod
    def check_v(cls, v: int) -> int:
        if not 0 <= v <= 20: raise ValueError("V doit être entre 0 et 20")
        return v

    @field_validator("a_score")
    @classmethod
    def check_a(cls, v: int) -> int:
        if not 0 <= v <= 20: raise ValueError("A doit être entre 0 et 20")
        return v

    @field_validator("k_score")
    @classmethod
    def check_k(cls, v: int) -> int:
        if not 0 <= v <= 20: raise ValueError("K doit être entre 0 et 20")
        return v


class RiasecRequest(BaseModel):
    """Scores bruts RIASEC — 6 dimensions."""
    R: int
    I: int
    A: int
    S: int
    E: int
    C: int


class DiscRequest(BaseModel):
    """Scores bruts DISC — 4 dimensions."""
    D: int
    I: int
    S: int
    C: int


class ValidateAssessmentRequest(BaseModel):
    """Validation finale du bilan par l'acteur CANOPE/COSP."""
    actor_comment: str | None = None
