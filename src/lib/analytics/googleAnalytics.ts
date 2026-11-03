import { JWT } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']

let cachedClient: JWT | null = null

const getClient = (): JWT | null => {
  const clientEmail = process.env.GA4_CLIENT_EMAIL
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) return null

  if (!cachedClient)
    cachedClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: SCOPES,
    })

  return cachedClient
}

export const isGoogleAnalyticsConfigured = (): boolean =>
  Boolean(
    process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY,
  )

export type GAReportRow = {
  dimensions: string[]
  metrics: number[]
}

const parseReportRows = (report: unknown): GAReportRow[] => {
  const rows = (report as { rows?: unknown[] })?.rows ?? []

  return rows.map((row) => {
    const typedRow = row as {
      dimensionValues?: { value?: string }[]
      metricValues?: { value?: string }[]
    }

    return {
      dimensions: (typedRow.dimensionValues ?? []).map((d) => d.value ?? ''),
      metrics: (typedRow.metricValues ?? []).map((m) => Number(m.value ?? 0)),
    }
  })
}

// GA4 Data API hard limit on requests per batchRunReports call
const MAX_BATCH_SIZE = 5

const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

const fetchReportBatch = async (requests: Record<string, unknown>[]): Promise<GAReportRow[][]> => {
  const client = getClient()
  const propertyId = process.env.GA4_PROPERTY_ID

  if (!client || !propertyId) {
    throw new Error('Google Analytics is not configured')
  }

  const { token } = await client.getAccessToken()

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Google Analytics API error (${response.status}): ${text}`)
  }

  const json = (await response.json()) as { reports?: unknown[] }

  return (json.reports ?? []).map(parseReportRows)
}

/**
 * Runs several GA4 Data API reports, transparently splitting them into
 * batches of MAX_BATCH_SIZE (the API's own limit per batchRunReports call),
 * and returns each report's rows already parsed into a simple
 * { dimensions, metrics } shape, in the same order as the input requests.
 */
export const runAnalyticsReports = async (
  requests: Record<string, unknown>[],
): Promise<GAReportRow[][]> => {
  const batches = chunkArray(requests, MAX_BATCH_SIZE)
  const results: GAReportRow[][] = []

  // Sequential, not Promise.all: this only runs on an infrequent background
  // poll, so avoiding bursts against GA4's quota matters more than latency.
  for (const batch of batches) {
    results.push(...(await fetchReportBatch(batch)))
  }

  return results
}

export type AnalyticsTotals = {
  activeUsers: number
  newUsers: number
  pageViews: number
}

export type AnalyticsTimeseriesPoint = { label: string; activeUsers: number }

export type AnalyticsSnapshot = {
  totals: AnalyticsTotals
  timeseries: {
    daily: AnalyticsTimeseriesPoint[]
    weekly: AnalyticsTimeseriesPoint[]
    monthly: AnalyticsTimeseriesPoint[]
  }
  topPages: { title: string; views: number }[]
  newVsReturning: { newUsers: number; returningUsers: number }
}

// GA4 `date` dimension value: "YYYYMMDD"
const formatDailyLabel = (value: string): string => {
  const day = value.slice(6, 8)
  const month = value.slice(4, 6)
  return `${day}/${month}`
}

// GA4 `yearWeek` dimension value: "YYYYWW"
const formatWeeklyLabel = (value: string): string => {
  const week = value.slice(4, 6)
  return `S${week}`
}

// GA4 `yearMonth` dimension value: "YYYYMM"
const formatMonthlyLabel = (value: string): string => {
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  return `${month}/${year}`
}

/**
 * Runs the (small) set of GA4 reports needed for the simplified admin
 * dashboard widget. Called by the background poller (see
 * refreshAnalyticsCache.ts), not per-request.
 */
export const buildAnalyticsSnapshot = async (): Promise<AnalyticsSnapshot> => {
  const [totals, dailyUsers, weeklyUsers, monthlyUsers, topPages, newVsReturning] =
    await runAnalyticsReports([
      {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'screenPageViews' }],
      },
      {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      },
      {
        dateRanges: [{ startDate: '84daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'yearWeek' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'yearWeek' } }],
      },
      {
        dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'yearMonth' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
      },
      {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: '5',
      },
      {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'newVsReturning' }],
        metrics: [{ name: 'activeUsers' }],
      },
    ])

  const [activeUsers = 0, newUsers = 0, pageViews = 0] = totals[0]?.metrics ?? []

  const newUsersCount = newVsReturning.find((row) => row.dimensions[0] === 'new')?.metrics[0] ?? 0
  const returningUsersCount =
    newVsReturning.find((row) => row.dimensions[0] === 'returning')?.metrics[0] ?? 0

  return {
    totals: { activeUsers, newUsers, pageViews },
    timeseries: {
      daily: dailyUsers.map((row) => ({
        label: formatDailyLabel(row.dimensions[0]),
        activeUsers: row.metrics[0] ?? 0,
      })),
      weekly: weeklyUsers.map((row) => ({
        label: formatWeeklyLabel(row.dimensions[0]),
        activeUsers: row.metrics[0] ?? 0,
      })),
      monthly: monthlyUsers.map((row) => ({
        label: formatMonthlyLabel(row.dimensions[0]),
        activeUsers: row.metrics[0] ?? 0,
      })),
    },
    topPages: topPages.map((row) => ({
      title: row.dimensions[0],
      views: row.metrics[0] ?? 0,
    })),
    newVsReturning: { newUsers: newUsersCount, returningUsers: returningUsersCount },
  }
}
