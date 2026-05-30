"use client"

/**
 * Affiche les résultats d'un test depuis les scores déjà sauvegardés dans l'assessment.
 * Permet de consulter les résultats sans refaire le test.
 */

import type { Assessment } from "@/types"
import { VakResults }    from "@/components/assessments/vak/VakResults"
import { RiasecResults } from "@/components/assessments/riasec/RiasecResults"
import { DiscResults }   from "@/components/assessments/disc/DiscResults"

export type ResultViewType = "vak" | "riasec" | "disc"

interface Props {
  assessment:     Assessment
  viewType:       ResultViewType
  onRetake:       () => void
  onBack:         () => void
  onCodeUpdate?:  (code: string) => Promise<void>
}

export function AssessmentResultsView({ assessment, viewType, onRetake, onBack, onCodeUpdate }: Props) {
  if (viewType === "vak") {
    const scores = {
      V: assessment.vak_v_score ?? 0,
      A: assessment.vak_a_score ?? 0,
      K: assessment.vak_k_score ?? 0,
    }
    return <VakResults scores={scores} onRetake={onRetake} onBack={onBack} />
  }

  if (viewType === "riasec" && assessment.riasec_scores) {
    return (
      <RiasecResults
        scores={assessment.riasec_scores}
        savedCode={assessment.riasec_code}
        onCodeUpdate={onCodeUpdate}
        onRetake={onRetake}
        onBack={onBack}
      />
    )
  }

  if (viewType === "disc" && assessment.disc_scores) {
    return <DiscResults scores={assessment.disc_scores} onRetake={onRetake} onBack={onBack} />
  }

  /* Sécurité : scores absents → retour au bilan */
  onBack()
  return null
}
