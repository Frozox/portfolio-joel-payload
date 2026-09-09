'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type TimeseriesPoint = { label: string; activeUsers: number }

type AnalyticsOverview = {
  configured: boolean
  error?: string
  totals?: {
    activeUsers: number
    newUsers: number
    sessions: number
    pageViews: number
    engagedSessions: number
    bounceRate: number
    engagementRate: number
    averageSessionDuration: number
  }
  timeseries?: {
    daily: TimeseriesPoint[]
    weekly: TimeseriesPoint[]
    monthly: TimeseriesPoint[]
  }
  topPages?: { path: string; views: number }[]
  trafficSources?: { source: string; sessions: number }[]
  devices?: { device: string; sessions: number }[]
  countries?: { country: string; activeUsers: number }[]
  newVsReturning?: { segment: string; activeUsers: number }[]
}

const PERIOD_TABS = [
  { key: 'daily', label: 'Jour' },
  { key: 'weekly', label: 'Semaine' },
  { key: 'monthly', label: 'Mois' },
] as const

type PeriodKey = (typeof PERIOD_TABS)[number]['key']

const formatPercent = (ratio: number): string => `${(ratio * 100).toFixed(1)}%`

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
}

export const AnalyticsWidget = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodKey>('daily')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/analytics-overview', { signal: controller.signal })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ configured: false, error: 'Erreur de chargement' }))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const chartData = useMemo(() => data?.timeseries?.[period] ?? [], [data, period])

  return (
    <div className="dashboard-widget dashboard-widget--wide">
      <h3 className="dashboard-widget__title">Google Analytics — 30 derniers jours</h3>

      {loading && <p className="dashboard-widget__muted">Chargement…</p>}

      {!loading && data && !data.configured && (
        <p className="dashboard-widget__muted">
          Non configuré. Ajoutez <code>GA4_PROPERTY_ID</code>, <code>GA4_CLIENT_EMAIL</code> et{' '}
          <code>GA4_PRIVATE_KEY</code> dans les variables d&apos;environnement.
        </p>
      )}

      {!loading && data?.error && <p className="dashboard-widget__error">{data.error}</p>}

      {!loading && data?.configured && !data.error && (
        <>
          <div className="dashboard-widget__stats">
            <div className="dashboard-widget__stat">
              <strong>{data.totals?.activeUsers ?? 0}</strong>
              <span>Utilisateurs actifs</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{data.totals?.newUsers ?? 0}</strong>
              <span>Nouveaux utilisateurs</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{data.totals?.sessions ?? 0}</strong>
              <span>Sessions</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{data.totals?.pageViews ?? 0}</strong>
              <span>Pages vues</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{formatPercent(data.totals?.engagementRate ?? 0)}</strong>
              <span>Taux d&apos;engagement</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{formatPercent(data.totals?.bounceRate ?? 0)}</strong>
              <span>Taux de rebond</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{formatDuration(data.totals?.averageSessionDuration ?? 0)}</strong>
              <span>Durée moy. session</span>
            </div>
          </div>

          <div className="dashboard-widget__tabs">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={
                  tab.key === period
                    ? 'dashboard-widget__tab dashboard-widget__tab--active'
                    : 'dashboard-widget__tab'
                }
                onClick={() => setPeriod(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="dashboard-widget__chart">
            <ResponsiveContainer width="100%" height={220}>
              {period === 'daily' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-150)" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="Utilisateurs actifs"
                    stroke="var(--theme-success-500, #22c55e)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-elevation-150)" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="activeUsers"
                    name="Utilisateurs actifs"
                    fill="var(--theme-success-500, #22c55e)"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="dashboard-widget__columns">
            <div>
              <h4>Pages les plus consultées</h4>
              <ul className="dashboard-widget__list">
                {(data.topPages ?? []).length === 0 && (
                  <li className="dashboard-widget__muted">Aucune donnée</li>
                )}
                {(data.topPages ?? []).map((page) => (
                  <li key={page.path}>
                    <span>{page.path}</span>
                    <span>{page.views}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Sources de trafic</h4>
              <ul className="dashboard-widget__list">
                {(data.trafficSources ?? []).length === 0 && (
                  <li className="dashboard-widget__muted">Aucune donnée</li>
                )}
                {(data.trafficSources ?? []).map((source) => (
                  <li key={source.source}>
                    <span>{source.source}</span>
                    <span>{source.sessions}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Appareils</h4>
              <ul className="dashboard-widget__list">
                {(data.devices ?? []).length === 0 && (
                  <li className="dashboard-widget__muted">Aucune donnée</li>
                )}
                {(data.devices ?? []).map((device) => (
                  <li key={device.device}>
                    <span>{device.device}</span>
                    <span>{device.sessions}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Pays</h4>
              <ul className="dashboard-widget__list">
                {(data.countries ?? []).length === 0 && (
                  <li className="dashboard-widget__muted">Aucune donnée</li>
                )}
                {(data.countries ?? []).map((country) => (
                  <li key={country.country}>
                    <span>{country.country}</span>
                    <span>{country.activeUsers}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Nouveaux vs récurrents</h4>
              <ul className="dashboard-widget__list">
                {(data.newVsReturning ?? []).length === 0 && (
                  <li className="dashboard-widget__muted">Aucune donnée</li>
                )}
                {(data.newVsReturning ?? []).map((segment) => (
                  <li key={segment.segment}>
                    <span>{segment.segment}</span>
                    <span>{segment.activeUsers}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
