import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import type { Issue } from '@/types'
import type { FileContent } from '@/lib/github'

const gateway = createOpenAI({
  baseURL: 'https://ai-gateway.vercel.sh/v1',
  apiKey: process.env.VERCEL_API_TOKEN,
})

const issueSchema = z.object({
  issues: z.array(
    z.object({
      title: z.string(),
      file: z.string(),
      line: z.number().optional(),
      snippet: z.string().optional(),
      fix: z.string().optional(),
      severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
    })
  ),
})

export async function runConfigAuditor(files: FileContent[]): Promise<Issue[]> {
  const filesContext = files
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join('\n\n')

  const { object } = await generateObject({
    model: gateway('anthropic/claude-sonnet-4-6'),
    schema: issueSchema,
    prompt: `You are a security expert auditing configuration files for security issues.

Analyze the following files and identify any:
- Missing security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Insecure next.config.js settings (disabled security features, unsafe redirects)
- NEXT_PUBLIC_ environment variables exposing secrets or sensitive data
- Overly permissive CORS configuration
- Disabled authentication or authorization checks
- Insecure cookie settings
- Missing rate limiting configuration
- Debug mode enabled in production

For each issue found:
- Provide a clear, specific title
- Include the file path and line number if possible
- Show the problematic configuration
- Suggest a secure configuration fix
- Mark severe misconfigurations as CRITICAL, suboptimal settings as WARNING, best practice suggestions as INFO

Only report real configuration issues. If no issues are found, return an empty issues array.

Files to analyze:
${filesContext}`,
  })

  return object.issues.map((issue, index) => ({
    id: `config-${index}-${Date.now()}`,
    agent: 'config' as const,
    ...issue,
  }))
}
