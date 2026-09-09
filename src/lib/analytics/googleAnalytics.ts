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

/**
 * Runs several GA4 Data API reports in a single batch request and returns
 * each report's rows already parsed into a simple { dimensions, metrics } shape.
 */
export const runAnalyticsReports = async (
  requests: Record<string, unknown>[],
): Promise<GAReportRow[][]> => {
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
