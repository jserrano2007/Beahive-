import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'
import { useWeather } from '../hooks/useWeather'
import { recordPlantingWeather } from '../data/store'
import { parseDateStr, toDateStr } from '../utils/dates'
import { buildWeatherAlerts, formatInches, weekRainInches } from '../utils/weatherAlerts'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import './WeatherStrip.css'

const FORECAST_TILES = 4 // today + next 3

function WeatherStrip({ plantingId, plantingMethod, neighborhoodKey }) {
  const { t, dict } = useI18n()
  const weather = useWeather(neighborhoodKey)

  useEffect(() => {
    if (weather && !weather.stale) recordPlantingWeather(plantingId, weather.days)
  }, [weather, plantingId])

  if (!weather || weather.days.length === 0) return null

  const todayStr = toDateStr(new Date())
  const todayIndex = weather.days.findIndex((day) => day.date === todayStr)
  if (todayIndex === -1) return null

  const tiles = weather.days.slice(todayIndex, todayIndex + FORECAST_TILES)
  const alerts = buildWeatherAlerts({ t, days: weather.days, todayStr, plantingMethod })
  const neighborhoodLabel = NEIGHBORHOODS.find((n) => n.key === neighborhoodKey)?.label ?? ''

  return (
    <div className="weather-strip">
      <div className="weather-strip-header">
        <span className="text-label">{t('garden.weather.heading', { neighborhood: neighborhoodLabel })}</span>
        <span className="weather-week-rain">
          {t('garden.weather.weekRain', { amount: formatInches(weekRainInches(weather.days, todayStr)) })}
        </span>
      </div>

      {alerts.length > 0 && (
        <ul className="weather-alerts">
          {alerts.map((alert) => (
            <li key={alert.id} className={`weather-alert ${alert.tone}`}>
              {alert.text}
            </li>
          ))}
        </ul>
      )}

      <ul className="weather-days">
        {tiles.map((day, index) => (
          <li key={day.date} className="weather-day">
            <span className="weather-day-label">
              {index === 0 ? t('garden.weather.today') : dict.weekdaysShort[parseDateStr(day.date).getDay()]}
            </span>
            <span className="weather-day-temps">
              {Math.round(day.tMax)}° <span className="weather-day-low">{Math.round(day.tMin)}°</span>
            </span>
            <span className="weather-day-rain">{day.precip > 0 ? formatInches(day.precip) : '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WeatherStrip
