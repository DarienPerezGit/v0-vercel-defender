import type { Issue } from '@/types'

export function calculateScore(issues: Issue[]): number {
  const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length
  const infoCount = issues.filter((i) => i.severity === 'INFO').length

  const score = 100 - criticalCount * 20 - warningCount * 7 - infoCount * 2

  return Math.max(0, score)
}
