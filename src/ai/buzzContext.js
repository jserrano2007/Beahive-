// Builds a compact JSON snapshot of internal app data for Buzz to ground answers in.
// Kept small on purpose — Haiku 4.5 is cheap but we still want fast responses.

import { isOpenNow, getStatusLine, inSeason } from '../utils/hours'
import {
  getGrowthProgress,
  getHarvestDateStr,
  trackingLevel,
} from '../utils/plantings'
import { getStatus } from '../services/sensors'
import {
  formatMetricValue,
  metricsForMethod,
} from '../utils/sensorMetrics'
import { getMetricStatus, getRange } from '../utils/sensorRanges'
import { cropName } from '../utils/crops'

const MAX_PLACES = 10
const MAX_LISTINGS = 10

function summarizePlace(place, now, lang) {
  const seasonOk = inSeason(place.season, now)
  const openNow = seasonOk && isOpenNow(place, now)
  return {
    name: place.name,
    category: place.category,
    address: place.address,
    neighborhood: place.neighborhood || null,
    open_now: Boolean(openNow),
    hours_status: getStatusLine(place, now, lang),
    snap: place.snap === true,
    snap_match: place.snapMatch === true,
    wic_fmnp: place.wicFmnp === true,
    phone: place.phone || null,
    website: place.website || null,
    notes: place.notes ? String(place.notes).slice(0, 140) : null,
  }
}

function summarizeListing(listing, lang) {
  return {
    crop: cropName(listing.cropId, lang) || listing.cropName || listing.cropId,
    price: listing.price != null ? `$${listing.price}/${listing.unit || 'ea'}` : null,
    seller: listing.displayName || listing.sellerName || 'Neighbor',
    neighborhood: listing.neighborhood || null,
    available_until: listing.availableUntil || null,
    accepts_snap: Boolean(listing.snap),
  }
}

function summarizePlanting(planting, devices, now, lang) {
  const progress = getGrowthProgress(planting, now, lang)
  const device = devices.find((d) => d.plantingId === planting.id) || null
  const summary = {
    crop: cropName(planting.cropId, lang) || planting.cropId,
    method: planting.method,
    day_of: progress ? `${progress.dayIndex} of ~${progress.totalDays}` : null,
    harvest_around: getHarvestDateStr(planting) || null,
    tracking_level: trackingLevel(planting, device),
    sensor: null,
  }

  if (device) {
    try {
      const status = getStatus(device.id)
      const reading = status.lastReading || null
      const metrics = metricsForMethod(device.method)
      const readings = {}
      let watchOrBad = null
      for (const metric of metrics) {
        const value = reading ? reading[metric] : null
        readings[metric] = formatMetricValue(metric, value)
        const range = getRange(planting.cropId, device.method, metric)
        const flag = getMetricStatus(value, range)
        if (flag === 'bad') watchOrBad = watchOrBad || `${metric}: out of range`
        else if (flag === 'watch' && !watchOrBad) watchOrBad = `${metric}: watch`
      }
      summary.sensor = {
        method: device.method,
        online: status.online,
        readings,
        alert: watchOrBad,
      }
    } catch {
      summary.sensor = { method: device.method, online: false, readings: null, alert: null }
    }
  }
  return summary
}

function seasonLabel(now) {
  const m = now.getMonth()
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'fall'
  return 'winter'
}

/**
 * Build the app-data snapshot Buzz sees before every reply.
 * All fields are strings/booleans/nulls — no HTML, no PII beyond seller display names.
 */
export function buildBuzzContext({
  places = [],
  listings = [],
  plantings = [],
  devices = [],
  account = {},
  now = new Date(),
  lang = 'en',
} = {}) {
  const openPlaces = places
    .map((p) => summarizePlace(p, now, lang))
    .filter((p) => p.open_now)
    .slice(0, MAX_PLACES)

  const readyListings = listings
    .filter((l) => l.status !== 'sold' && l.status !== 'archived')
    .slice(0, MAX_LISTINGS)
    .map((l) => summarizeListing(l, lang))

  const myPlantings = plantings
    .filter((p) => p.status !== 'finished')
    .slice(0, 6)
    .map((p) => summarizePlanting(p, devices, now, lang))

  return {
    today: {
      iso: now.toISOString().slice(0, 10),
      weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
      season: seasonLabel(now),
      is_winter_market_freeze: seasonLabel(now) === 'winter',
    },
    user: {
      neighborhood: account.preferredNeighborhood || account.neighborhood || null,
      language: lang,
    },
    open_food_places: openPlaces,
    neighbor_listings: readyListings,
    my_plantings: myPlantings,
    counts: {
      total_places_in_data: places.length,
      total_open_now: openPlaces.length,
      total_neighbor_listings: readyListings.length,
      total_my_plantings: myPlantings.length,
    },
  }
}
