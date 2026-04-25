import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import type { Issue } from '@/types'
import type { FileContent } from '@/lib/github'

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

export async function runSecretDetector(files: FileContent[]): Promise<Issue[]> {
  const filesContext = files
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join('\n\n')

  const { object } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: issueSchema,
    prompt: `You are a security expert analyzing code for hardcoded secrets and sensitive data exposure.

Analyze the following files and identify any:
- Hardcoded API keys, tokens, or passwords
- Database connection strings with credentials
- Private keys or certificates
- AWS credentials, OAuth secrets
- Any sensitive data that should be in environment variables

For each issue found:
- Provide a clear title describing the secret type
- Include the file path and line number if possible
- In the snippet, REDACT the actual secret value (e.g., "API_KEY=sk-****...")
- Suggest a fix using environment variables
- Mark hardcoded production secrets as CRITICAL, test/example secrets as WARNING, potential issues as INFO

Only report real issues you can identify. If no secrets are found, return an empty issues array.

Files to analyze:
${filesContext}`,
  })

  return object.issues.map((issue, index) => ({
    id: `secret-${index}-${Date.now()}`,
    agent: 'secrets' as const,
    ...issue,
  }))
}
