import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { cropName } from '../utils/crops'
import { formatShortDate } from '../utils/dates'
import { growingMethodLabel } from '../utils/plantings'
import { HYDRO_REPORT_METRICS, PROBLEM_TYPES } from '../utils/growReport'
import { formatMetricValue } from '../utils/sensorMetrics'
import { formatInches, formatTempF } from '../utils/weatherAlerts'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import MiniChart from './MiniChart'
import './GrowReport.css'

function Stat({ label, value }) {
  return (
    <div className="report-stat">
      <span className="report-stat-value">{value}</span>
      <span className="report-stat-label">{label}</span>
    </div>
  )
}

function SharePanel({ plantingId, account, sharedRow, onShare, onUnshare }) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const hasName = Boolean(account.displayName)
  const [anonymous, setAnonymous] = useState(!hasName)

  if (sharedRow) {
    return (
      <div className="report-share">
        <p className="report-share-status">
          {t('garden.report.sharedAs', {
            date: formatShortDate(sharedRow.sharedAt.slice(0, 10), lang),
            name: sharedRow.anonymous ? t('garden.report.anonymous') : sharedRow.authorName,
          })}
        </p>
        <div className="garden-actions">
          <button
            type="button"
            className="garden-sell-btn"
            onClick={() => onShare(plantingId, { anonymous: sharedRow.anonymous })}
          >
            {t('garden.report.updateShare')}
          </button>
          <button type="button" className="garden-remove-btn" onClick={() => onUnshare(plantingId)}>
            {t('garden.report.stopSharing')}
          </button>
        </div>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="report-share">
        <button type="button" className="garden-sell-btn" onClick={() => setOpen(true)}>
          {t('garden.report.share')}
        </button>
      </div>
    )
  }

  return (
    <div className="report-share" role="radiogroup" aria-label={t('garden.report.shareHow')}>
      <span className="text-label">{t('garden.report.shareHow')}</span>
      <label className="report-share-choice">
        <input
          type="radio"
          name={`share-${plantingId}`}
          checked={!anonymous}
          disabled={!hasName}
          onChange={() => setAnonymous(false)}
        />
        {hasName
          ? t('garden.report.showName', { name: account.displayName })
          : t('garden.report.showNameMissing')}
      </label>
      <label className="report-share-choice">
        <input
          type="radio"
          name={`share-${plantingId}`}
          checked={anonymous}
          onChange={() => setAnonymous(true)}
        />
        {t('garden.report.stayAnonymous')}
      </label>
      <p className="text-note">{t('garden.report.sharePrivacy')}</p>
      <div className="garden-actions">
        <button
          type="button"
          className="garden-limit-upgrade"
          onClick={() => {
            onShare(plantingId, { anonymous })
            setOpen(false)
          }}
        >
          {t('garden.report.shareConfirm')}
        </button>
        <button type="button" className="garden-confirm-no" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}

function GrowReport({ report, account, sharedRow, onShare, onUnshare, onAskCommunity }) {
  const { t, lang } = useI18n()
  const { metrics } = report
  const hood = NEIGHBORHOODS.find((n) => n.key === report.neighborhoodKey)?.label
  const date = (value) => (value ? formatShortDate(value, lang) : '—')
  const yieldText =
    report.yield.length > 0
      ? report.yield.map((y) => `${y.amount} ${t(`garden.harvest.unit.${y.unit}`)}`).join(' + ')
      : '—'
  const singleUnit = report.yield.length === 1 ? report.yield[0].unit : null
  const weather = metrics.weather
  const hasSensorData =
    (metrics.hydro && Object.values(metrics.hydro).some(Boolean)) || Boolean(metrics.soilMoisture)
  const problemCount = PROBLEM_TYPES.reduce((sum, type) => sum + report.problems[type], 0)

  return (
    <section className="grow-report" aria-label={t('garden.report.title')}>
      <header className="grow-report-header">
        <span className="text-label">{t('garden.report.title')}</span>
        <h3>{cropName(report.cropId, lang)}</h3>
        <p className="text-note">
          {[growingMethodLabel(report.method, lang), hood].filter(Boolean).join(' · ')}
        </p>
        <p className="text-note">
          {t('garden.report.dates', {
            planted: date(report.datePlanted),
            firstHarvest: date(report.firstHarvestDate),
          })}
          {report.finishedAt && ` · ${t('garden.report.finished', { date: date(report.finishedAt) })}`}
        </p>
      </header>

      <div className="report-stats">
        <Stat
          label={t('garden.report.daysToFirstHarvest')}
          value={report.daysToFirstHarvest ?? '—'}
        />
        <Stat label={t('garden.report.totalYield')} value={yieldText} />
        <Stat
          label={t('garden.report.avgQuality')}
          value={report.averageQuality != null ? `${report.averageQuality}/5` : '—'}
        />
        <Stat label={t('garden.report.harvests')} value={report.harvestCount} />
      </div>

      {singleUnit && report.harvestSeries.length > 1 && (
        <div className="report-section">
          <span className="text-label">
            {t('garden.report.harvestChart', { unit: t(`garden.harvest.unit.${singleUnit}`) })}
          </span>
          <MiniChart
            type="bars"
            label={t('garden.report.harvestChart', { unit: t(`garden.harvest.unit.${singleUnit}`) })}
            points={report.harvestSeries.map((h) => ({ label: date(h.date), value: h.amount }))}
            formatValue={(value) => `${value} ${t(`garden.harvest.unit.${singleUnit}`)}`}
          />
        </div>
      )}

      {metrics.hydro && (
        <div className="report-section">
          <span className="text-label">{t('garden.report.hydroHeading')}</span>
          {HYDRO_REPORT_METRICS.map((metric) => {
            const stats = metrics.hydro[metric]
            const name = t(`garden.sensor.metric.${metric}`)
            if (!stats) return null
            return (
              <div key={metric} className="report-metric">
                <div className="report-metric-row">
                  <strong>{name}</strong>
                  <span>
                    {t('garden.report.avgMinMax', {
                      avg: formatMetricValue(metric, stats.avg),
                      min: formatMetricValue(metric, stats.min),
                      max: formatMetricValue(metric, stats.max),
                    })}
                  </span>
                </div>
                <MiniChart
                  label={t('garden.report.dailyAvg', { metric: name })}
                  points={stats.daily.map((d) => ({ label: date(d.date), value: d.value }))}
                  band={stats.range}
                  formatValue={(value) => formatMetricValue(metric, value)}
                />
                {stats.daysOutOfRange != null && (
                  <span className={`status-chip ${stats.daysOutOfRange > 0 ? 'warning' : 'open'}`}>
                    {t('garden.report.daysOutOfRange', {
                      days: stats.daysOutOfRange,
                      total: stats.daysTracked,
                    })}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {metrics.soilMoisture && (
        <div className="report-section">
          <span className="text-label">{t('garden.report.soilHeading')}</span>
          <div className="report-metric">
            <div className="report-metric-row">
              <strong>{t('garden.report.avgSoilMoisture')}</strong>
              <span>{formatMetricValue('soilMoisture', metrics.soilMoisture.avg)}</span>
            </div>
            <MiniChart
              label={t('garden.report.dailyAvg', { metric: t('garden.sensor.metric.soilMoisture') })}
              points={metrics.soilMoisture.daily.map((d) => ({ label: date(d.date), value: d.value }))}
              band={metrics.soilMoisture.range}
              formatValue={(value) => formatMetricValue('soilMoisture', value)}
            />
          </div>
        </div>
      )}

      {(weather || metrics.waterings != null) && (
        <div className="report-section">
          <span className="text-label">{t('garden.report.weatherHeading')}</span>
          <div className="report-stats">
            {metrics.waterings != null && (
              <Stat label={t('garden.report.waterings')} value={metrics.waterings} />
            )}
            {weather && (
              <>
                <Stat label={t('garden.report.totalRain')} value={formatInches(weather.totalRain)} />
                <Stat
                  label={t('garden.report.avgTemps')}
                  value={`${formatTempF(weather.avgHigh)} / ${formatTempF(weather.avgLow)}`}
                />
                <Stat label={t('garden.report.frostNights')} value={weather.frostNights} />
              </>
            )}
          </div>
          {weather && weather.daily.length > 1 && (
            <>
              <span className="text-label">{t('garden.report.rainChart')}</span>
              <MiniChart
                type="bars"
                label={t('garden.report.rainChart')}
                points={weather.daily.map((d) => ({ label: date(d.date), value: d.rain }))}
                formatValue={formatInches}
              />
              <span className="text-label">{t('garden.report.highChart')}</span>
              <MiniChart
                label={t('garden.report.highChart')}
                points={weather.daily.map((d) => ({ label: date(d.date), value: d.high }))}
                formatValue={formatTempF}
                color="var(--sunflower)"
              />
            </>
          )}
          {!weather && <p className="text-note">{t('garden.report.noWeather')}</p>}
        </div>
      )}

      {!hasSensorData && !weather && metrics.waterings == null && (
        <p className="text-note">{t('garden.report.noSensorOrWeather')}</p>
      )}

      <div className="report-section">
        <span className="text-label">{t('garden.report.problemsHeading')}</span>
        {problemCount === 0 ? (
          <p className="text-note">{t('garden.report.noProblems')}</p>
        ) : (
          <div className="report-problems">
            {PROBLEM_TYPES.filter((type) => report.problems[type] > 0).map((type) => (
              <span key={type} className="status-chip warning">
                {t(`garden.report.problem.${type}`, { count: report.problems[type] })}
              </span>
            ))}
          </div>
        )}
      </div>

      {report.notes.length > 0 && (
        <div className="report-section">
          <span className="text-label">{t('garden.report.nextTimeHeading')}</span>
          <ul className="report-notes">
            {report.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {onAskCommunity && (
        <button
          type="button"
          className="garden-sell-btn report-ask-btn"
          onClick={() => onAskCommunity(report.plantingId)}
        >
          <span aria-hidden="true">💬</span> {t('community.askAboutReport')}
        </button>
      )}

      <SharePanel
        plantingId={report.plantingId}
        account={account}
        sharedRow={sharedRow}
        onShare={onShare}
        onUnshare={onUnshare}
      />
    </section>
  )
}

export default GrowReport
