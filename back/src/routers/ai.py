"""
Router analyse IA — génère une synthèse d'orientation via Groq (Llama 3, gratuit).
Préfixe : /api/v1/assessments
"""

import os
from fastapi import APIRouter, HTTPException

from src.dependencies import DbDep, CurrentUser
from src.services import assessments as svc

router = APIRouter(prefix="/assessments", tags=["Analyse IA"])

_VAK   = {"V": "Visuel", "A": "Auditif", "K": "Kinesthésique"}
_DISC  = {"D": "Dominance", "I": "Influence", "S": "Stabilité", "C": "Conformité"}
_RIASC = {
    "R": "Réaliste", "I": "Investigateur", "A": "Artistique",
    "S": "Social",   "E": "Entreprenant",  "C": "Conventionnel",
}


def _build_prompt(a: dict) -> str:
    """Construit le prompt à partir des résultats du bilan (dict retourné par le service)."""
    lines = [
        "Tu es un conseiller d'orientation scolaire expert à Madagascar.",
        "Voici les résultats d'orientation d'un élève :\n",
    ]
    if a.get("vak_dominant"):
        lines.append(f"- Style d'apprentissage VAK : {_VAK.get(a['vak_dominant'], a['vak_dominant'])} (dominant)")
    if a.get("riasec_code"):
        labels = " → ".join(_RIASC.get(l, l) for l in a["riasec_code"])
        lines.append(f"- Profil RIASEC : {a['riasec_code']} ({labels})")
    if a.get("disc_dominant"):
        lines.append(f"- Profil DISC : {_DISC.get(a['disc_dominant'], a['disc_dominant'])}")
    if a.get("serie"):
        lines.append(f"- Série scolaire : {a['serie']}")
    if a.get("career_interest"):
        lines.append(f"- Intérêt déclaré : {a['career_interest']}")
    lines += [
        "\nRédige une synthèse d'orientation en français (150-200 mots) destinée au conseiller.",
        "Structure : profil global de l'élève → style d'apprentissage recommandé → pistes d'orientation → conseils pratiques.",
        "Sois concret, bienveillant et actionnable. Ne numérote pas les parties.",
    ]
    return "\n".join(lines)


@router.post("/{assessment_id}/ai-analysis")
async def generate_ai_analysis(
    assessment_id: str, current_user: CurrentUser, db: DbDep,
):
    """Génère une synthèse IA pour le conseiller via Groq Llama 3 (gratuit)."""
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key.startswith("gsk_..."):
        raise HTTPException(status_code=503, detail="Service IA non configuré (GROQ_API_KEY manquant)")

    assessment: dict = svc.get_assessment(db, assessment_id, current_user)

    if not any([assessment.get("vak_dominant"), assessment.get("riasec_code"), assessment.get("disc_dominant")]):
        raise HTTPException(status_code=400, detail="Aucun résultat de test disponible pour générer une analyse")

    prompt = _build_prompt(assessment)

    try:
        from groq import Groq  # import différé — évite l'échec au démarrage si non installé
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.choices[0].message.content or ""
        return {"text": text}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Erreur Groq : {exc}")
