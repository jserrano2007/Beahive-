import { CROPS, getCropById, cropName } from './crops'
import { addDays, daysBetween, parseDateStr, toDateStr } from './dates'
import { LOCALES } from '../i18n/locales'
import { NEIGHBORHOODS } from './neighborhoods'

export { CROPS, getCropById }

export const GROWING_METHODS = ['Garden bed', 'Container', 'Hydroponic']
export const OUTDOOR_METHODS = ['Garden bed', 'Container']

export const CHECK_IN_TYPES = [
  { type: 'watered', icon: '💧' },
  { type: 'fertilized', icon: '🌱' },
  { type: 'pests', icon: '🐛' },
  { type: 'yellowing', icon: '🍂' },
  { type: 'pruned', icon: '✂️' },
]
const NOTE_ICON = '📝'

export function checkInIcon(type) {
  return CHECK_IN_TYPES.find((entry) => entry.type === type)?.icon ?? NOTE_ICON
}

export function isOutdoorPlanting(planting) {
  return OUTDOOR_METHODS.includes(planting.method)
}

// Older plantings have no neighborhood; fall back to the account's.
export function plantingNeighborhoodKey(planting, account) {
  const keys = NEIGHBORHOODS.map((n) => n.key)
  if (keys.includes(planting.neighborhoodKey)) return planting.neighborhoodKey
  if (keys.includes(account?.neighborhood)) return account.neighborhood
  if (keys.includes(account?.preferredNeighborhood)) return account.preferredNeighborhood
  return NEIGHBORHOODS[0]?.key ?? null
}

// 'soil' | 'hydro' when a sensor is paired, otherwise 'weather' outdoors
// and 'checkins' indoors (no weather data applies).
export function trackingLevel(planting, device) {
  if (device) return device.method === 'hydro' ? 'hydro' : 'soil'
  return isOutdoorPlanting(planting) ? 'weather' : 'checkins'
}

export function growingMethodLabel(method, lang = 'en') {
  const dict = LOCALES[lang] ?? LOCALES.en
  return dict[`growingMethods.${method}`] ?? LOCALES.en[`growingMethods.${method}`] ?? method
}

export function getHarvestDateStr(planting) {
  const crop = getCropById(planting.cropId)
  if (!crop) return null
  return toDateStr(addDays(parseDateStr(planting.datePlanted), crop.days))
}

export function getGrowthProgress(planting, now, lang = 'en') {
  const crop = getCropById(planting.cropId)
  const harvestDateStr = getHarvestDateStr(planting)
  if (!crop || !harvestDateStr) return null

  const today = toDateStr(now)
  const dayIndex = Math.max(1, daysBetween(planting.datePlanted, today) + 1)
  const daysRemaining = daysBetween(today, harvestDateStr)
  const fraction = Math.min(1, Math.max(0, dayIndex / crop.days))

  return {
    cropName: cropName(planting.cropId, lang),
    totalDays: crop.days,
    dayIndex,
    daysRemaining,
    harvestDateStr,
    fraction,
    isReady: daysRemaining <= 0,
  }
}
