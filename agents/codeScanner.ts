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

export async function runCodeScanner(files: FileContent[]): Promise<Issue[]> {
  const filesContext = files
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join('\n\n')

  const { object } = await generateObject({
    model: gateway('anthropic/claude-sonnet-4-6'),
    schema: issueSchema,
    prompt: `You are a security expert analyzing code for vulnerabilities.

Analyze the following files and identify any:
- SQL injection vulnerabilities (unsanitized user input in queries)
- XSS vulnerabilities (unsanitized user input in HTML/JSX)
- Use of eval() or Function() with user input
- Path traversal vulnerabilities
- Server-Side Request Forgery (SSRF)
- Missing input validation in API routes
- Unsafe deserialization
- Command injection

For each issue found:
- Provide a clear, specific title
- Include the file path and line number if possible
- Show the vulnerable code snippet
- Suggest a specific fix with code example
- Mark exploitable vulnerabilities as CRITICAL, potential issues as WARNING, code smells as INFO

Only report real security issues. If no vulnerabilities are found, return an empty issues array.

Files to analyze:
${filesContext}`,
  })

  return object.issues.map((issue, index) => ({
    id: `code-${index}-${Date.now()}`,
    agent: 'code' as const,
    ...issue,
  }))
}
