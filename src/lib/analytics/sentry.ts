export type SentryIssue = {
  id: string
  title: string
  culprit: string
  level: string
  count: string
  userCount: number
  lastSeen: string
  permalink: string
}

export const isSentryApiConfigured = (): boolean =>
  Boolean(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT)

export const fetchSentryIssues = async (): Promise<SentryIssue[]> => {
  const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT } = process.env

  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT) {
    throw new Error('Sentry API is not configured')
  }

  const url = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?statsPeriod=14d&query=is:unresolved&sort=freq&limit=5`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Sentry API error (${response.status}): ${text}`)
  }

  const issues = (await response.json()) as Record<string, unknown>[]

  return issues.map((issue) => ({
    id: String(issue.id),
    title: String(issue.title ?? ''),
    culprit: String(issue.culprit ?? ''),
    level: String(issue.level ?? ''),
    count: String(issue.count ?? '0'),
    userCount: Number(issue.userCount ?? 0),
    lastSeen: String(issue.lastSeen ?? ''),
    permalink: String(issue.permalink ?? ''),
  }))
}
