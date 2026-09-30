import { useI18n } from '../i18n/useI18n'
import { cropName } from '../utils/crops'
import { formatShortDate } from '../utils/dates'
import { growingMethodLabel } from '../utils/plantings'
import { HYDRO_REPORT_METRICS, PROBLEM_TYPES } from '../utils/growReport'
import { formatMetricValue } from '../utils/sensorMetrics'
import { formatInches, formatTempF } from '../utils/weatherAlerts'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import './GrowReport.css'

function Stat({ label, value }) {
  return (
    <div className="report-stat">
      <span className="report-stat-value">{value}</span>
      <span className="report-stat-label">{label}</span>
    </div>
  )
}

function MetricRow({ name, stats, metric }) {
  const { t } = useI18n()
  return (
    <div className="report-metric-row">
      <strong>{name}</strong>
      <span>
        {t('garden.report.avgMinMax', {
          avg: formatMetricValue(metric, stats.avg),
          min: formatMetricValue(metric, stats.min),
          max: formatMetricValue(metric, stats.max),
        })}
        {stats.daysOutOfRange > 0 &&
          ` · ${t('garden.report.daysOutOfRange', { days: stats.daysOutOfRange, total: stats.daysTracked })}`}
      </span>
    </div>
  )
}

// Chart-free Grow Report for posts and shared-report cards. Takes the
// shape from summarizeReport / summarizeSharedRow.
function ReportSummaryCard({ summary, byline = null }) {
  const { t, lang } = useI18n()
  const hood = NEIGHBORHOODS.find((n) => n.key === summary.neighborhoodKey)?.label
  const yieldText =
    summary.yield.length > 0
      ? summary.yield.map((y) => `${y.amount} ${t(`garden.harvest.unit.${y.unit}`)}`).join(' + ')
      : '—'
  const hydroRows = HYDRO_REPORT_METRICS.filter((metric) => summary.hydro?.[metric])
  const problems = PROBLEM_TYPES.filter((type) => summary.problems?.[type] > 0)
  const weather = summary.weather

  return (
    <section className="grow-report report-summary" aria-label={t('garden.report.title')}>
      <header className="grow-report-header">
        <span className="text-label">{t('garden.report.title')}</span>
        <h3>{cropName(summary.cropId, lang)}</h3>
        <p className="text-note">
          {[growingMethodLabel(summary.method, lang), hood].filter(Boolean).join(' · ')}
          {summary.datePlanted &&
            ` · ${t('reports.planted', { date: formatShortDate(summary.datePlanted, lang) })}`}
        </p>
        {byline && <p className="text-note">{byline}</p>}
      </header>

      <div className="report-stats">
        <Stat label={t('garden.report.daysToFirstHarvest')} value={summary.daysToFirstHarvest ?? '—'} />
        <Stat label={t('garden.report.harvests')} value={summary.harvestCount} />
        <Stat label={t('garden.report.totalYield')} value={yieldText} />
        <Stat
          label={t('garden.report.avgQuality')}
          value={summary.averageQuality != null ? `${summary.averageQuality}/5` : '—'}
        />
      </div>

      {(hydroRows.length > 0 || summary.soilMoisture) && (
        <div className="report-metric">
          {hydroRows.map((metric) => (
            <MetricRow
              key={metric}
              metric={metric}
              name={t(`garden.sensor.metric.${metric}`)}
              stats={summary.hydro[metric]}
            />
          ))}
          {summary.soilMoisture && (
            <MetricRow
              metric="soilMoisture"
              name={t('garden.sensor.metric.soilMoisture')}
              stats={summary.soilMoisture}
            />
          )}
        </div>
      )}

      {(summary.waterings != null || weather) && (
        <div className="report-metric">
          {summary.waterings != null && (
            <div className="report-metric-row">
              <strong>{t('garden.report.waterings')}</strong>
              <span>{summary.waterings}</span>
            </div>
          )}
          {weather && (
            <>
              <div className="report-metric-row">
                <strong>{t('garden.report.totalRain')}</strong>
                <span>{formatInches(weather.totalRain)}</span>
              </div>
              <div className="report-metric-row">
                <strong>{t('garden.report.avgTemps')}</strong>
                <span>
                  {formatTempF(weather.avgHigh)} / {formatTempF(weather.avgLow)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="report-problems">
        {problems.length === 0 ? (
          <span className="status-chip open">
            {t('garden.report.problemsHeading')}: {t('garden.report.noProblems')}
          </span>
        ) : (
          problems.map((type) => (
            <span key={type} className="status-chip warning">
              {t(`garden.report.problem.${type}`, { count: summary.problems[type] })}
            </span>
          ))
        )}
      </div>

      {summary.notes?.length > 0 && (
        <ul className="report-notes">
          {summary.notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ReportSummaryCard
