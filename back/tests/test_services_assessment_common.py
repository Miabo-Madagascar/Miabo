"""
Tests unitaires — calculs des profils dominants (assessment_common.py).
"""

from src.services import assessment_common as common


def test_vak_dominant_v():
    assert common.vak_dominant(10, 5, 8) == "V"


def test_vak_dominant_k():
    assert common.vak_dominant(4, 4, 11) == "K"


def test_riasec_code():
    scores = {"R": 4, "I": 7, "A": 2, "S": 9, "E": 5, "C": 3}
    code = common.riasec_code(scores)
    assert len(code) == 3
    assert "S" in code
    assert "I" in code


def test_disc_dominant_seul():
    assert common.disc_dominant({"D": 5, "I": 20, "S": 2, "C": 1}) == "I"


def test_disc_dominant_ex_aequo():
    """Score >= 40% du dominant → ex-aequo inclus, triés par score desc."""
    assert common.disc_dominant({"D": 12, "I": 18, "S": 9, "C": 15}) == "ICDS"
