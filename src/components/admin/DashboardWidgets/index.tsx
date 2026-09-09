import { AnalyticsWidget } from './AnalyticsWidget'
import { SentryWidget } from './SentryWidget'
import './styles.css'

export const DashboardWidgets = () => {
  return (
    <div className="dashboard-widgets">
      <AnalyticsWidget />
      <SentryWidget />
    </div>
  )
}
