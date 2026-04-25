export type Severity = 'CRITICAL' | 'WARNING' | 'INFO'

export type AgentName = 'code' | 'secrets' | 'config' | 'performance'

export interface Issue {
  id: string
  severity: Severity
  agent: AgentName
  title: string
  file: string
  line?: number
  snippet?: string
  fix?: string
}

export interface AgentStatus {
  name: AgentName
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  issueCount: number
}

export interface ScanResult {
  score: number
  issues: Issue[]
  agents: AgentStatus[]
  scannedAt: string
  repo: string
}
