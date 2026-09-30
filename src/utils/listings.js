import { NEIGHBORHOODS } from './neighborhoods'
import { CROPS, getCropById } from './crops'
import { addDays, formatShortDate, parseDateStr, toDateStr } from './dates'
import { LOCALES } from '../i18n/locales'
import { interpolate } from '../i18n/interpolate'

export { CROPS, getCropById, formatShortDate }

const READY_EARLY_DAYS = 7
const READY_LATE_DAYS = 28

const UNIT_KEYS = {
  pint: 'units.pint.short',
  lb: 'units.lb.short',
  bunch: 'units.bunch.short',
  head: 'units.head.short',
  each: 'units.each.short',
  free: 'units.free.short',
}

function t(lang, key, vars) {
  const dict = LOCALES[lang] ?? LOCALES.en
  const raw = dict[key] ?? LOCALES.en[key] ?? key
  return interpolate(raw, vars)
}

export function getReadyWindow(datePlanted, cropId) {
  const crop = getCropById(cropId)
  if (!crop || !datePlanted) return null
  const planted = parseDateStr(datePlanted)
  return {
    start: toDateStr(addDays(planted, crop.days - READY_EARLY_DAYS)),
    end: toDateStr(addDays(planted, crop.days + READY_LATE_DAYS)),
  }
}

export function getReadyStatus(listing, now, lang = 'en') {
  const window = getReadyWindow(listing.datePlanted, listing.cropId)
  if (!window) return { text: t(lang, 'findFood.readyDateUnknown'), open: false }
  const today = toDateStr(now)
  if (today >= window.start && today <= window.end) {
    return { text: t(lang, 'findFood.readyNow'), open: true }
  }
  return { text: t(lang, 'findFood.readyAround', { date: formatShortDate(window.start, lang) }), open: false }
}

export function formatListingPrice(listing, lang = 'en') {
  if (listing.unit === 'free') return t(lang, 'price.free')
  const unitKey = UNIT_KEYS[listing.unit]
  const unitLabel = unitKey ? t(lang, unitKey) : listing.unit
  return t(lang, 'price.perUnit', { price: listing.price, unit: unitLabel })
}

export function groupListingsByNeighborhood(listings = [], lang = 'en') {
  const groups = new Map()
  const safeListings = listings ?? []

  safeListings.forEach((listing) => {
    if (listing.sellerType === 'business') return
    const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
    if (!neighborhood) return
    if (!groups.has(neighborhood.key)) {
      groups.set(neighborhood.key, { neighborhood, listings: [] })
    }
    groups.get(neighborhood.key).listings.push(listing)
  })

  return [...groups.values()].map(({ neighborhood, listings: groupListings }) => ({
    id: `neighborhood-${neighborhood.key}`,
    isNeighborhoodGroup: true,
    category: 'home_grower',
    name: t(lang, `findFood.neighborhoodListings_${groupListings.length === 1 ? 'one' : 'other'}`, {
      neighborhood: neighborhood.label,
      count: groupListings.length,
    }),
    neighborhoodKey: neighborhood.key,
    neighborhoodLabel: neighborhood.label,
    lat: neighborhood.lat,
    lng: neighborhood.lng,
    count: groupListings.length,
    listings: groupListings,
  }))
}

export function groupBusinessListingsByNeighborhood(listings = [], lang = 'en') {
  const groups = new Map()
  const safeListings = listings ?? []

  safeListings.forEach((listing) => {
    if (listing.sellerType !== 'business' || listing.linkedSourceId) return
    const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
    if (!neighborhood) return
    const key = `${listing.displayName}-${neighborhood.key}`
    if (!groups.has(key)) {
      groups.set(key, { neighborhood, displayName: listing.displayName, listings: [] })
    }
    groups.get(key).listings.push(listing)
  })

  return [...groups.entries()].map(([key, { neighborhood, displayName, listings: groupListings }]) => ({
    id: `business-${key}`,
    isBusinessPlace: true,
    category: 'business',
    name: displayName,
    address: t(lang, 'findFood.nearNeighborhood', { neighborhood: neighborhood.label }),
    neighborhoodLabel: neighborhood.label,
    lat: neighborhood.lat,
    lng: neighborhood.lng,
    count: groupListings.length,
    listings: groupListings,
  }))
}

export function listingsForSource(listings = [], sourceId) {
  return (listings ?? []).filter(
    (listing) => listing.sellerType === 'business' && listing.linkedSourceId === sourceId,
  )
}
