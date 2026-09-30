import { getWeatherCache, saveWeatherCache } from '../data/store'
import { NEIGHBORHOODS } from '../utils/neighborhoods'

// Open-Meteo is free and needs no API key.
const API_URL = 'https://api.open-meteo.com/v1/forecast'
const PAST_DAYS = 7
const FORECAST_DAYS = 4 // today + next 3

const inFlight = new Map()

function buildUrl({ lat, lng }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    temperature_unit: 'fahrenheit',
    precipitation_unit: 'inch',
    timezone: 'auto',
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
  })
  return `${API_URL}?${params}`
}

function parseDaily(json) {
  const daily = json?.daily
  if (!daily || !Array.isArray(daily.time)) throw new Error('Unexpected weather response')
  return daily.time
    .map((date, index) => ({
      date,
      tMin: daily.temperature_2m_min?.[index] ?? null,
      tMax: daily.temperature_2m_max?.[index] ?? null,
      precip: daily.precipitation_sum?.[index] ?? null,
    }))
    .filter((day) => day.tMin != null && day.tMax != null)
}

async function fetchDays(neighborhood) {
  const response = await fetch(buildUrl(neighborhood))
  if (!response.ok) throw new Error(`Weather request failed (${response.status})`)
  return parseDaily(await response.json())
}

// Resolves to { days, stale } or null when nothing is available. Fresh cache
// is served without a request; on failure, stale cache is used if present.
export function loadNeighborhoodWeather(neighborhoodKey) {
  const cached = getWeatherCache(neighborhoodKey)
  if (cached?.fresh) return Promise.resolve({ days: cached.days, stale: false })

  const neighborhood = NEIGHBORHOODS.find((n) => n.key === neighborhoodKey)
  if (!neighborhood) return Promise.resolve(null)

  if (!inFlight.has(neighborhoodKey)) {
    const request = fetchDays(neighborhood)
      .then((days) => {
        saveWeatherCache(neighborhoodKey, days)
        return { days, stale: false }
      })
      .catch(() => (cached ? { days: cached.days, stale: true } : null))
      .finally(() => inFlight.delete(neighborhoodKey))
    inFlight.set(neighborhoodKey, request)
  }
  return inFlight.get(neighborhoodKey)
}
