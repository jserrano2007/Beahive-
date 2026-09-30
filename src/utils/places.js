export const HARTFORD_CENTER = { lat: 41.7658, lng: -72.6734 }

const EARTH_RADIUS_MILES = 3958.8

export function distanceMiles(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_MILES * c
}

export function hasCoords(place) {
  return typeof place.lat === 'number' && typeof place.lng === 'number'
}

export function directionsAddress(place) {
  const streetAddress = place.address.replace(/\s*\([^)]*\)/g, '').trim()
  const cityState = place.zip ? `${place.city}, CT ${place.zip}` : `${place.city}, CT`
  return `${streetAddress}, ${cityState}`
}

export async function fetchPlaces() {
  const res = await fetch('/data/sources.json')
  if (!res.ok) {
    throw new Error(`Failed to load places: ${res.status}`)
  }
  const data = await res.json()
  return (data.sources ?? []).filter((place) => place.status !== 'possibly_inactive')
}
