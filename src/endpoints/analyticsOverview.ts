import type { Endpoint } from 'payload'

import { isGoogleAnalyticsConfigured, runAnalyticsReports } from '@/lib/analytics/googleAnalytics'

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

export const analyticsOverviewEndpoint: Endpoint = {
  path: '/analytics-overview',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isGoogleAnalyticsConfigured()) {
      return Response.json({ configured: false })
    }

    try {
      const [firstBatch, secondBatch] = await Promise.all([
        runAnalyticsReports([
          {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'newUsers' },
              { name: 'sessions' },
              { name: 'screenPageViews' },
              { name: 'engagedSessions' },
              { name: 'bounceRate' },
              { name: 'engagementRate' },
              { name: 'averageSessionDuration' },
            ],
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
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: '5',
          },
        ]),
        runAnalyticsReports([
          {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: '5',
          },
          {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          },
          {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: '5',
          },
          {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'newVsReturning' }],
            metrics: [{ name: 'activeUsers' }],
          },
        ]),
      ])

      const [totals, dailyUsers, weeklyUsers, monthlyUsers, topPages] = firstBatch
      const [trafficSources, devices, countries, newVsReturning] = secondBatch

      const [
        activeUsers = 0,
        newUsers = 0,
        sessions = 0,
        pageViews = 0,
        engagedSessions = 0,
        bounceRate = 0,
        engagementRate = 0,
        averageSessionDuration = 0,
      ] = totals[0]?.metrics ?? []

      return Response.json({
        configured: true,
        totals: {
          activeUsers,
          newUsers,
          sessions,
          pageViews,
          engagedSessions,
          bounceRate,
          engagementRate,
          averageSessionDuration,
        },
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
          path: row.dimensions[0],
          views: row.metrics[0] ?? 0,
        })),
        trafficSources: trafficSources.map((row) => ({
          source: row.dimensions[0],
          sessions: row.metrics[0] ?? 0,
        })),
        devices: devices.map((row) => ({
          device: row.dimensions[0],
          sessions: row.metrics[0] ?? 0,
        })),
        countries: countries.map((row) => ({
          country: row.dimensions[0],
          activeUsers: row.metrics[0] ?? 0,
        })),
        newVsReturning: newVsReturning.map((row) => ({
          segment: row.dimensions[0] === 'new' ? 'Nouveaux' : 'Récurrents',
          activeUsers: row.metrics[0] ?? 0,
        })),
      })
    } catch (error) {
      req.payload.logger.error(error)
      return Response.json(
        { configured: true, error: 'Impossible de charger les données Google Analytics' },
        { status: 502 },
      )
    }
  },
}
