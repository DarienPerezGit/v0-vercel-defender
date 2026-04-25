import type { Issue, AgentStatus, ScanResult } from '@/types'
import { calculateScore } from '@/lib/score'
import { getRelevantFiles } from '@/lib/github'
import { runSecretDetector } from '@/agents/secretDetector'
import { runCodeScanner } from '@/agents/codeScanner'
import { runConfigAuditor } from '@/agents/configAuditor'
import { runPerformanceAgent } from '@/agents/performanceAgent'

const SEVERITY_ORDER = { CRITICAL: 0, WARNING: 1, INFO: 2 }

export async function runSecurityScan(repo: string): Promise<ScanResult> {
  // Fetch files from GitHub
  const files = await getRelevantFiles(repo)

  if (files.length === 0) {
    throw new Error('No relevant files found in the repository')
  }

  // Initialize agent statuses
  const agents: AgentStatus[] = [
    { name: 'code', label: 'Code Scanner', status: 'pending', issueCount: 0 },
    { name: 'secrets', label: 'Secret Detector', status: 'pending', issueCount: 0 },
    { name: 'config', label: 'Config Audit', status: 'pending', issueCount: 0 },
    { name: 'performance', label: 'Performance', status: 'pending', issueCount: 0 },
  ]

  // Run all agents concurrently with Promise.allSettled
  const results = await Promise.allSettled([
    runCodeScanner(files),
    runSecretDetector(files),
    runConfigAuditor(files),
    runPerformanceAgent(files),
  ])

  // Collect issues from successful agents
  const allIssues: Issue[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      agents[index].status = 'done'
      agents[index].issueCount = result.value.length
      allIssues.push(...result.value)
    } else {
      agents[index].status = 'error'
      console.error(`Agent ${agents[index].name} failed:`, result.reason)
    }
  })

  // Sort issues by severity
  allIssues.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  // Calculate score
  const score = calculateScore(allIssues)

  return {
    score,
    issues: allIssues,
    agents,
    scannedAt: new Date().toISOString(),
    repo,
  }
}
