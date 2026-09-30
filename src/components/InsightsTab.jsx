import { useI18n } from '../i18n/useI18n'
import { getInsights } from '../data/store'
import { formatShortDate } from '../utils/dates'
import './InsightsTab.css'

function InsightsTab({ account = {}, now }) {
  const { t, tCount, dict, lang } = useI18n()

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

      {insights.stopBreakdown && insights.stopBreakdown.length > 0 && (
        <div className="insights-top">
          <h3>{t('insights.byStopHeading')}</h3>
          <p className="insights-note">{t('insights.byStopNote')}</p>
          <ul className="insights-stop-list">
            {insights.stopBreakdown.map((row) => (
              <li key={row.stopId} className="insights-stop-row">
                <div className="insights-stop-label">
                  {row.stopId === 'unassigned'
                    ? t('insights.byStopUnassigned')
                    : (
                        <>
                          <span className="insights-stop-title">{row.label}</span>
                          {row.date && (
                            <span className="insights-stop-date">
                              {formatShortDate(row.date, lang)}
                            </span>
                          )}
                        </>
                      )}
                </div>
                <div className="insights-stop-metrics">
                  <span>{tCount('insights.view', row.views)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('insights.messagesCount', { count: row.messages })}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default InsightsTab
