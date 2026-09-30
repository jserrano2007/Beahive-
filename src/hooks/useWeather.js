import { useEffect, useState } from 'react'
import { loadNeighborhoodWeather } from '../services/weather'

// Returns { days, stale } for a neighborhood, or null while loading / when
// no weather is available (callers hide their UI in that case).
export function useWeather(neighborhoodKey) {
  const [result, setResult] = useState({ key: null, weather: null })

  useEffect(() => {
    if (!neighborhoodKey) return undefined
    let cancelled = false
    loadNeighborhoodWeather(neighborhoodKey).then((weather) => {
      if (!cancelled) setResult({ key: neighborhoodKey, weather })
    })
    return () => {
      cancelled = true
    }
  }, [neighborhoodKey])

  return result.key === neighborhoodKey ? result.weather : null
}
