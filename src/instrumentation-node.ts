import { getPayload } from 'payload'

import configPromise from '@payload-config'

import { refreshAnalyticsCache } from '@/lib/analytics/refreshAnalyticsCache'

// Isolated from instrumentation.ts (shared with the edge runtime) so Turbopack
// doesn't pull Payload - and its Node-only internals - into the edge bundle.
const ANALYTICS_POLL_INTERVAL_MINUTES = Number(process.env.ANALYTICS_POLL_INTERVAL_MINUTES) || 30

const pollerState = globalThis as unknown as { __analyticsPollerStarted?: boolean }

const pollAnalytics = async () => {
  try {
    const payload = await getPayload({ config: configPromise })
    await refreshAnalyticsCache(payload)
  } catch (error) {
    console.error('[analytics-poller]', error)
  }
}

export const startAnalyticsPoller = () => {
  if (pollerState.__analyticsPollerStarted) return
  pollerState.__analyticsPollerStarted = true

  void pollAnalytics()
  setInterval(pollAnalytics, ANALYTICS_POLL_INTERVAL_MINUTES * 60 * 1000)
}
