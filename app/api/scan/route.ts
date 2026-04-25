import { NextResponse } from 'next/server'
import { runSecurityScan } from '@/lib/orchestrator'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { repo } = body

    if (!repo || typeof repo !== 'string') {
      return NextResponse.json(
        { error: 'Repository is required' },
        { status: 400 }
      )
    }

    // Validate "owner/repo" format
    const repoPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/
    if (!repoPattern.test(repo)) {
      return NextResponse.json(
        { error: 'Invalid repository format. Use "owner/repo"' },
        { status: 400 }
      )
    }

    const result = await runSecurityScan(repo)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    )
  }
}
