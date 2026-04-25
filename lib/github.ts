const fileContentCache = new Map<string, string>()

interface TreeItem {
  path: string
  type: 'blob' | 'tree'
  sha: string
}

interface TreeResponse {
  tree: TreeItem[]
  truncated: boolean
}

const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  'coverage',
  '.turbo',
  'build',
  '__pycache__',
]

const RELEVANT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.env',
  '.env.local',
  '.env.example',
]

function shouldSkip(path: string): boolean {
  return SKIP_PATTERNS.some((pattern) => path.includes(pattern))
}

function isRelevantFile(path: string): boolean {
  if (shouldSkip(path)) return false
  return RELEVANT_EXTENSIONS.some((ext) => path.endsWith(ext))
}

export interface FileContent {
  path: string
  content: string
}

export async function getRelevantFiles(repo: string): Promise<FileContent[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Get the default branch first
  const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
    headers,
  })

  if (!repoResponse.ok) {
    throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`)
  }

  const repoData = await repoResponse.json()
  const defaultBranch = repoData.default_branch || 'main'

  // Get the file tree
  const treeResponse = await fetch(
    `https://api.github.com/repos/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers }
  )

  if (!treeResponse.ok) {
    throw new Error(`Failed to fetch tree: ${treeResponse.statusText}`)
  }

  const treeData: TreeResponse = await treeResponse.json()

  // Filter relevant files
  const relevantFiles = treeData.tree
    .filter((item) => item.type === 'blob' && isRelevantFile(item.path))
    .slice(0, 50) // Limit to 50 files

  // Fetch content for each file
  const fileContents: FileContent[] = []

  for (const file of relevantFiles) {
    const cacheKey = `${repo}:${file.path}:${file.sha}`

    if (fileContentCache.has(cacheKey)) {
      fileContents.push({
        path: file.path,
        content: fileContentCache.get(cacheKey)!,
      })
      continue
    }

    try {
      const contentResponse = await fetch(
        `https://api.github.com/repos/${repo}/contents/${file.path}`,
        { headers }
      )

      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        const content = Buffer.from(contentData.content, 'base64').toString(
          'utf-8'
        )
        fileContentCache.set(cacheKey, content)
        fileContents.push({ path: file.path, content })
      }
    } catch {
      // Skip files that fail to fetch
    }
  }

  return fileContents
}
