import { useI18n } from '../i18n/useI18n'
import { getInsights } from '../data/store'
import './InsightsTab.css'

function InsightsTab({ account = {}, now }) {
  const { t, tCount, dict } = useI18n()

  if (!(account.type === 'business' && account.verified)) {
    return (
      <div className="insights-tab">
        <div className="insights-empty-state">
          <p>{t('insights.businessOnlyTitle')}</p>
          <p>{t('insights.businessOnlyBody')}</p>
        </div>
      </div>
    )
  }

  const insights = getInsights(now)
  const maxDailyViews = Math.max(1, ...insights.dailyViews.map((day) => day.count))

  function weekdayLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return dict.weekdaysShort[new Date(y, m - 1, d).getDay()]
  }

  return (
    <div className="insights-tab">
      <h2>{t('insights.title')}</h2>
      <div className="insights-stats">
        <div className="insights-stat">
          <span className="insights-stat-value">{insights.totalViews}</span>
          <span className="insights-stat-label">{t('insights.viewsThisWeek')}</span>
        </div>
        <div className="insights-stat">
          <span className="insights-stat-value">{insights.messageTaps}</span>
          <span className="insights-stat-label">{t('insights.messageTaps')}</span>
        </div>
      </div>

      <div className="insights-top">
        <h3>{t('insights.topListings')}</h3>
        {insights.topListings.length === 0 ? (
          <p className="insights-empty">{t('insights.noViewsYet')}</p>
        ) : (
          <ol className="insights-top-list">
            {insights.topListings.map((item) => (
              <li key={item.listingId}>
                <span>{item.label}</span>
                <span>{tCount('insights.view', item.views)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="insights-chart">
        <h3>{t('insights.viewsPerDay')}</h3>
        <div className="insights-bars">
          {insights.dailyViews.map((day) => (
            <div key={day.date} className="insights-bar-col">
              <div
                className="insights-bar"
                style={{ height: `${Math.max(4, (day.count / maxDailyViews) * 96)}px` }}
                title={`${day.count}`}
              />
              <span className="insights-bar-label">{weekdayLabel(day.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InsightsTab
