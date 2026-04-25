import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import type { Issue } from '@/types'
import type { FileContent } from '@/lib/github'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1/anthropic',
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

export async function runPerformanceAgent(files: FileContent[]): Promise<Issue[]> {
  const filesContext = files
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join('\n\n')

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: issueSchema,
    prompt: `You are a Next.js performance expert analyzing code for optimization opportunities.

Analyze the following files and identify any:
- Images using <img> tag instead of next/image (missing optimization)
- Large components that should use dynamic imports (next/dynamic)
- Missing fetch cache options in Server Components (no cache: 'force-cache' or revalidate)
- Full library imports instead of tree-shakeable imports (e.g., import _ from 'lodash' vs import map from 'lodash/map')
- Missing React.memo on expensive pure components
- Unnecessary client-side rendering ('use client' when not needed)
- Large bundle imports that could be lazy loaded
- Missing Suspense boundaries for async components

For each issue found:
- Provide a clear, specific title
- Include the file path and line number if possible
- Show the problematic code
- Suggest an optimized alternative with code example
- Mark critical performance issues (large bundle impact) as CRITICAL, moderate issues as WARNING, minor optimizations as INFO

Only report real performance issues. If no issues are found, return an empty issues array.

Files to analyze:
${filesContext}`,
  })

  return object.issues.map((issue, index) => ({
    id: `perf-${index}-${Date.now()}`,
    agent: 'performance' as const,
    ...issue,
  }))
}
