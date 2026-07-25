import { MODULES, type ModuleId, type QuestionOption } from './questions'

export type RiskLevel = 'low' | 'moderate' | 'high'

export interface ScreeningResult {
  score: number
  maxScore: number
  healthScore: number // 0-100, inverted so higher = better awareness/lower risk
  level: RiskLevel
  emergency: boolean
}

/**
 * Deliberately simple, transparent additive scoring — NOT a diagnostic
 * algorithm. It exists only to sort answers into an awareness-level bucket
 * and to trigger the "see a doctor" messaging. Every threshold here should
 * be reviewed by a qualified clinician before real-world use; see README.
 */
export function scoreModule(
  moduleId: ModuleId,
  answers: Record<string, string>
): ScreeningResult {
  const module = MODULES[moduleId]
  let score = 0
  let maxScore = 0
  let emergency = false

  for (const q of module.questions) {
    const chosen: QuestionOption | undefined = q.options.find(
      (o) => o.value === answers[q.id]
    )
    const highestOptionScore = Math.max(...q.options.map((o) => o.score))
    maxScore += highestOptionScore
    if (chosen) {
      score += chosen.score
      if (chosen.emergency) emergency = true
    }
  }

  const pct = maxScore > 0 ? score / maxScore : 0
  const level: RiskLevel = pct >= 0.6 ? 'high' : pct >= 0.3 ? 'moderate' : 'low'
  const healthScore = Math.round((1 - pct) * 100)

  return { score, maxScore, healthScore, level, emergency: emergency || level === 'high' }
}
