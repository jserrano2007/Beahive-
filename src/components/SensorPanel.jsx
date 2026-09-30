import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { useSensor } from '../hooks/useSensor'
import { SCENARIOS, setOffline, setScenario } from '../services/sensors'
import { defaultSensorMethodFor, formatMetricValue, metricsForMethod } from '../utils/sensorMetrics'
import { getMetricStatus, getRange } from '../utils/sensorRanges'
import { buildSensorAlerts } from '../utils/sensorAlerts'
import { formatClockTime } from '../utils/dates'
import Sparkline from './Sparkline'
import SensorPairSheet from './SensorPairSheet'
import './SensorPanel.css'

const STATUS_CHIP_CLASS = {
  good: 'open',
  watch: 'warning',
  bad: 'tomato',
  unknown: 'closed',
}

const STATUS_ICON = {
  good: '✓',
  watch: '!',
  bad: '×',
  unknown: '–',
}

const SPARKLINE_STROKE = {
  good: 'var(--leaf)',
  watch: 'var(--sunflower)',
  bad: 'var(--tomato)',
  unknown: 'var(--muted)',
}

function lastUpdatedLabel(t, lastUpdatedAt) {
  if (!lastUpdatedAt) return ''
  const seconds = Math.max(0, Math.round((Date.now() - lastUpdatedAt) / 1000))
  if (seconds < 60) return t('garden.sensor.lastUpdatedSeconds', { seconds })
  return t('garden.sensor.lastUpdatedMinutes', { minutes: Math.round(seconds / 60) })
}

function SensorPanel({
  plantingId,
  plantingMethod,
  cropId,
  cropLabel,
  device,
  learnMode = false,
  onPairDevice,
  onDisconnectDevice,
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [pairing, setPairing] = useState(false)
  const [pairMethod, setPairMethod] = useState(() => defaultSensorMethodFor(plantingMethod))
  const [openLearnMetric, setOpenLearnMetric] = useState(null)

  const sensor = useSensor(device?.id ?? null)

  if (!device) {
    return (
      <div className="sensor-panel">
        <button type="button" className="garden-sell-btn" onClick={() => setPairing(true)}>
          {t('garden.sensor.connect')}
        </button>
        <SensorPairSheet
          open={pairing}
          method={pairMethod}
          onChangeMethod={setPairMethod}
          onClose={() => setPairing(false)}
          onSubmit={() => {
            onPairDevice(plantingId, pairMethod)
            setPairing(false)
          }}
        />
      </div>
    )
  }

  const reading = sensor.reading
  const metrics = metricsForMethod(device.method)
  const alerts = expanded ? buildSensorAlerts({ t, method: device.method, cropId, cropLabel, reading }) : []
  const isSimulated = reading?.simulated ?? true
  const updatedLabel = lastUpdatedLabel(t, sensor.lastUpdatedAt)

  function toggleLearnMetric(metric) {
    setOpenLearnMetric((prev) => (prev === metric ? null : metric))
  }

  return (
    <div className="sensor-panel">
      <button
        type="button"
        className="sensor-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span>{t('garden.sensor.dashboardToggle')}</span>
        <span className="sensor-toggle-chevron" aria-hidden="true">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="sensor-panel-body">
          <div className="sensor-status-row">
            <span className={`status-chip ${sensor.online ? 'open' : 'closed'}`}>
              {sensor.online
                ? t('garden.sensor.online')
                : t('garden.sensor.offlineSince', {
                    time: formatClockTime(new Date(sensor.offlineSince)),
                  })}
            </span>
            {sensor.online && updatedLabel && (
              <span className="sensor-updated">{updatedLabel}</span>
            )}
          </div>

          {!sensor.online && (
            <p className="sensor-offline-hint">{t('garden.sensor.offlineHint')}</p>
          )}

          {isSimulated && <p className="text-label sensor-demo-label">{t('garden.sensor.demoLabel')}</p>}

          {alerts.length > 0 && (
            <ul className="sensor-alerts">
              {alerts.map((alert) => (
                <li key={alert.id} className="sensor-alert-card">
                  <span className="sensor-alert-icon" aria-hidden="true">!</span>
                  <span>{alert.text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="sensor-tiles">
            {metrics.map((metric) => {
              const range = getRange(cropId, device.method, metric)
              const value = reading ? reading[metric] : null
              const status = getMetricStatus(value, range)
              const values = sensor.history.map((point) => point[metric])
              const learnOpen = learnMode && openLearnMetric === metric

              return (
                <div className={`sensor-tile status-${status}`} key={metric}>
                  <span className="sensor-tile-label">{t(`garden.sensor.metric.${metric}`)}</span>
                  <span className="sensor-tile-value">{formatMetricValue(metric, value)}</span>
                  <Sparkline values={values} stroke={SPARKLINE_STROKE[status]} />
                  <span className={`status-chip ${STATUS_CHIP_CLASS[status]} sensor-tile-status`}>
                    <span className="sensor-tile-status-icon" aria-hidden="true">
                      {STATUS_ICON[status]}
                    </span>
                    {t(`garden.sensor.status.${status}`)}
                  </span>
                  <span className="sensor-tile-updated">
                    {sensor.online
                      ? updatedLabel || t('garden.sensor.online')
                      : t('garden.sensor.offlineShort')}
                  </span>
                  {learnMode && (
                    <button
                      type="button"
                      className="sensor-tile-learn-toggle"
                      aria-expanded={learnOpen}
                      aria-controls={`sensor-learn-${metric}`}
                      onClick={() => toggleLearnMetric(metric)}
                    >
                      <span aria-hidden="true">💡</span> {t('learn.whatIsThis')}
                    </button>
                  )}
                  {learnOpen && (
                    <p
                      id={`sensor-learn-${metric}`}
                      className="sensor-tile-learn-body"
                    >
                      {t(`learn.sensor.${metric}`)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {isSimulated && (
            <div className="sensor-demo-controls">
              <span className="text-label">{t('garden.sensor.demoControls')}</span>

              <label className="field">
                <span>{t('garden.sensor.scenarioLabel')}</span>
                <select
                  value={sensor.scenario}
                  onChange={(event) => setScenario(device.id, event.target.value)}
                >
                  {SCENARIOS[device.method].map((scenario) => (
                    <option key={scenario} value={scenario}>
                      {t(`garden.sensor.scenario.${scenario}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sensor-offline-toggle">
                <input
                  type="checkbox"
                  checked={!sensor.online}
                  onChange={(event) => setOffline(device.id, event.target.checked)}
                />
                {t('garden.sensor.simulateOffline')}
              </label>

              <button type="button" className="garden-remove-btn" onClick={() => onDisconnectDevice(plantingId)}>
                {t('garden.sensor.disconnect')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SensorPanel
