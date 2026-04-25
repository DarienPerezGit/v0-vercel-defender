# Vercel Defender

An AI-powered security scanner for GitHub repositories. Analyze your codebase for vulnerabilities, exposed secrets, misconfigurations, and performance issues using multiple specialized AI agents.

## Features

- **Multi-Agent Architecture** — Four specialized AI agents work concurrently to analyze your code:
  - **Code Scanner** — Detects SQL injection, XSS, SSRF, command injection, and other code vulnerabilities
  - **Secret Detector** — Identifies exposed API keys, tokens, passwords, and credentials
  - **Config Auditor** — Reviews configuration files for security misconfigurations
  - **Performance Agent** — Flags performance anti-patterns and optimization opportunities

- **Real-Time Scanning** — Enter any public GitHub repository (`owner/repo`) and get instant security analysis
- **Security Score** — Visual gauge showing overall repository health (0-100)
- **Severity Classification** — Issues categorized as Critical, Warning, or Info with actionable fix suggestions
- **Code Snippets** — See the exact vulnerable code with line numbers and suggested remediations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: Vercel AI SDK with Claude Sonnet 4.6
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Language**: TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) and enter a repository to scan

## Project Structure

```
├── app/
│   ├── api/scan/       # Security scan API endpoint
│   └── page.tsx        # Main dashboard UI
├── agents/             # AI security agents
│   ├── codeScanner.ts
│   ├── secretDetector.ts
│   ├── configAuditor.ts
│   └── performanceAgent.ts
├── components/         # React components
│   ├── score-gauge.tsx
│   ├── agent-pill.tsx
│   └── issue-card.tsx
├── lib/
│   ├── orchestrator.ts # Agent coordination
│   ├── github.ts       # GitHub API integration
│   └── score.ts        # Score calculation
└── types/              # TypeScript definitions
```

## How It Works

1. User enters a GitHub repository in `owner/repo` format
2. The orchestrator fetches relevant files via GitHub API
3. Four AI agents analyze the code concurrently using `Promise.allSettled`
4. Results are aggregated, sorted by severity, and a security score is calculated
5. Issues are displayed with severity badges, code snippets, and fix suggestions

## Built with v0

This project was built with [v0](https://v0.app). Continue developing:

[Continue working on v0](https://v0.app/chat/projects/prj_NaTmd26legsFMmn7Keo7xzDCUm0F)

## License

MIT
