import { addDays, toDateStr } from './dates'

export const FROST_F = 32
export const RAIN_SKIP_WATERING_IN = 1
export const HEAT_WAVE_F = 90
const HEAT_WAVE_DAYS = 3
const RAIN_WINDOW_DAYS = 7

export function formatTempF(value) {
  return `${Math.round(value)}F`
}

export function formatInches(value) {
  return `${(Math.round(value * 10) / 10).toFixed(1)} in`
}

// Rain over the last 7 days, today included.
export function weekRainInches(days, todayStr) {
  const start = toDateStr(addDays(new Date(`${todayStr}T12:00:00`), -(RAIN_WINDOW_DAYS - 1)))
  return days
    .filter((day) => day.date >= start && day.date <= todayStr)
    .reduce((sum, day) => sum + (day.precip ?? 0), 0)
}

export function buildWeatherAlerts({ t, days, todayStr, plantingMethod }) {
  const alerts = []
  const todayIndex = days.findIndex((day) => day.date === todayStr)
  if (todayIndex === -1) return alerts

  // Tonight's low shows up as tomorrow's daily minimum (early morning).
  const tonight = days[todayIndex + 1] ?? days[todayIndex]
  if (tonight.tMin <= FROST_F) {
    alerts.push({ id: 'frost', tone: 'tomato', text: t('garden.weather.alert.frost', { temp: formatTempF(tonight.tMin) }) })
  }

  const rain = weekRainInches(days, todayStr)
  if (rain >= RAIN_SKIP_WATERING_IN) {
    alerts.push({ id: 'rain', tone: 'open', text: t('garden.weather.alert.rain', { amount: formatInches(rain) }) })
  }

  const upcoming = days.slice(todayIndex, todayIndex + HEAT_WAVE_DAYS)
  if (upcoming.length === HEAT_WAVE_DAYS && upcoming.every((day) => day.tMax >= HEAT_WAVE_F)) {
    const key = plantingMethod === 'Container' ? 'garden.weather.alert.heatContainer' : 'garden.weather.alert.heatBed'
    alerts.push({ id: 'heat', tone: 'warning', text: t(key) })
  }

  return alerts
}
