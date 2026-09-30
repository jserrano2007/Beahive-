import { getNow } from '../utils/hours'
import { addDays, toDateStr } from '../utils/dates'
import { CROPS } from '../utils/crops'
import { buildGrowReport, summarizeReport } from '../utils/growReport'
import { buildDemoPosts, buildDemoSharedReports } from './communitySeed'
import { detectDefaultLanguage } from '../i18n/detectLanguage'
import { LOCALES } from '../i18n/locales'
import { interpolate } from '../i18n/interpolate'

const LISTINGS_KEY = 'freshmile_listings'
const PLANTINGS_KEY = 'freshmile_plantings'
const SEEDED_KEY = 'freshmile_seeded'
const ACCOUNT_KEY = 'freshmile_account'
const EVENTS_KEY = 'freshmile_events'
const CONVERSATIONS_KEY = 'freshmile_conversations'
const SELLER_RATINGS_KEY = 'freshmile_seller_ratings'
const DEVICES_KEY = 'freshmile_devices'
const SENSOR_HISTORY_KEY = 'freshmile_sensor_history'
const WEATHER_CACHE_KEY = 'freshmile_weather_cache'
const SHARED_REPORTS_KEY = 'freshmile_shared_reports'
const COMMUNITY_POSTS_KEY = 'freshmile_community_posts'
const COMMUNITY_SEEDED_KEY = 'freshmile_community_seeded'

function t(lang, key, vars) {
  const dict = LOCALES[lang] ?? LOCALES.en
  const raw = dict[key] ?? LOCALES.en[key] ?? key
  return interpolate(raw, vars)
}

const DEFAULT_ACCOUNT = {
  type: 'neighbor',
  displayName: '',
  neighborhood: '',
  subscription: 'free',
  businessName: null,
  businessType: null,
  linkedSourceId: null,
  registrationId: null,
  contactEmail: null,
  verified: false,
  preferredNeighborhood: null,
  language: null,
  learnMode: false,
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

function readArray(key, fallback = []) {
  const value = readJSON(key, fallback)
  return Array.isArray(value) ? value : fallback
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---- Demo seed data ----

const DEMO_SELLER_NAMES = [
  "Maria's porch garden",
  "Tyrell's backyard beds",
  'Nguyen family plot',
  "Grandma Rosa's tomatoes",
]

const DEMO_NEIGHBORHOODS = ['north-end', 'frog-hollow', 'asylum-hill', 'south-end']
const DEMO_UNITS = ['lb', 'pint', 'bunch', 'head', 'each', 'free', 'lb', 'pint']
const DEMO_HARVEST_OFFSETS = [-10, -3, 0, 5, 10, 15, 20, 25]

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1))
}

function buildDemoListings() {
  const sellers = DEMO_SELLER_NAMES.map((name) => ({
    name,
    rating: Number(randomBetween(4.2, 4.9).toFixed(1)),
    reviewCount: randomInt(3, 8),
  }))

  const now = getNow()

  return DEMO_HARVEST_OFFSETS.map((offset, index) => {
    const crop = CROPS[index % CROPS.length]
    const neighborhoodKey = DEMO_NEIGHBORHOODS[index % DEMO_NEIGHBORHOODS.length]
    const seller = sellers[index % sellers.length]
    const unit = DEMO_UNITS[index % DEMO_UNITS.length]
    const datePlanted = toDateStr(addDays(now, offset - crop.days))

    return {
      id: `demo-listing-${index}`,
      sellerType: 'neighbor',
      plantingId: null,
      cropId: crop.id,
      datePlanted,
      price: unit === 'free' ? 0 : Number(randomBetween(1, 6).toFixed(2)),
      unit,
      neighborhoodKey,
      photo: null,
      displayName: seller.name,
      snap: index % 3 !== 0,
      demo: true,
      sellerRating: seller.rating,
      sellerReviewCount: seller.reviewCount,
    }
  })
}

const DEMO_BUYER_NAMES = ['Alex R.', 'Jordan P.', 'Sam K.', 'Taylor M.']

const DEMO_INSIGHT_LISTINGS = [
  { id: 'demo-business-listing-1', label: 'Heirloom tomatoes' },
  { id: 'demo-business-listing-2', label: 'Sweet corn' },
  { id: 'demo-business-listing-3', label: 'Winter squash' },
]

function buildDemoEvents() {
  const now = getNow()
  const events = []

  for (let offset = 6; offset >= 0; offset--) {
    const date = toDateStr(addDays(now, -offset))
    DEMO_INSIGHT_LISTINGS.forEach((listing, index) => {
      const viewCount = randomInt(1, 5) + (index === 0 ? 3 : 0)
      for (let v = 0; v < viewCount; v++) {
        events.push({
          id: `demo-event-${date}-${listing.id}-${v}`,
          type: 'view',
          listingId: listing.id,
          label: listing.label,
          date,
        })
      }
    })
  }

  events.push({
    id: 'demo-event-message-1',
    type: 'message',
    listingId: DEMO_INSIGHT_LISTINGS[0].id,
    label: DEMO_INSIGHT_LISTINGS[0].label,
    date: toDateStr(addDays(now, -2)),
  })
  events.push({
    id: 'demo-event-message-2',
    type: 'message',
    listingId: DEMO_INSIGHT_LISTINGS[1].id,
    label: DEMO_INSIGHT_LISTINGS[1].label,
    date: toDateStr(addDays(now, -1)),
  })

  return events
}

function ensureSeeded() {
  if (localStorage.getItem(SEEDED_KEY)) return
  writeJSON(LISTINGS_KEY, buildDemoListings())
  writeJSON(PLANTINGS_KEY, [])
  writeJSON(EVENTS_KEY, buildDemoEvents())
  localStorage.setItem(SEEDED_KEY, '1')
}

// Seeded separately so people who already have the app get the demo
// community without losing their data.
function ensureCommunitySeeded() {
  if (localStorage.getItem(COMMUNITY_SEEDED_KEY)) return
  writeJSON(COMMUNITY_POSTS_KEY, [...readArray(COMMUNITY_POSTS_KEY, []).filter((post) => !post.demo), ...buildDemoPosts()])
  writeJSON(SHARED_REPORTS_KEY, [
    ...readArray(SHARED_REPORTS_KEY, []).filter((row) => !row.demo),
    ...buildDemoSharedReports(),
  ])
  localStorage.setItem(COMMUNITY_SEEDED_KEY, '1')
}

ensureSeeded()
ensureCommunitySeeded()

// ---- Listings ----

export function getListings() {
  return readArray(LISTINGS_KEY, [])
}

export function saveListing(listing, lang = 'en') {
  const listings = readArray(LISTINGS_KEY, [])
  writeJSON(LISTINGS_KEY, [...listings, listing])
  if (!listing.demo) {
    seedInboundInquiry(listing, lang)
  }
}

export function updateListing(id, patch) {
  const listings = readArray(LISTINGS_KEY, [])
  writeJSON(
    LISTINGS_KEY,
    listings.map((listing) => (listing.id === id ? { ...listing, ...patch } : listing)),
  )
}

export function removeListing(id) {
  const listings = readArray(LISTINGS_KEY, [])
  writeJSON(
    LISTINGS_KEY,
    listings.filter((listing) => listing.id !== id),
  )
}

// ---- Plantings ----

export function getPlantings() {
  return readArray(PLANTINGS_KEY, []).map((planting) => ({
    ...planting,
    notes: Array.isArray(planting.notes) ? planting.notes : [],
    harvests: Array.isArray(planting.harvests) ? planting.harvests : [],
    status: planting.status === 'finished' ? 'finished' : 'active',
  }))
}

function updatePlanting(plantingId, update) {
  const plantings = readArray(PLANTINGS_KEY, [])
  writeJSON(
    PLANTINGS_KEY,
    plantings.map((planting) => (planting.id === plantingId ? update(planting) : planting)),
  )
}

// Harvest: { id, date, amount, unit, quality (1-5), photo, changeNextTime }
export function addPlantingHarvest(plantingId, entry) {
  const harvest = { ...entry, id: `harvest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
  updatePlanting(plantingId, (planting) => ({
    ...planting,
    harvests: [...(Array.isArray(planting.harvests) ? planting.harvests : []), harvest],
  }))
}

// Live report for an active planting; the saved snapshot once finished.
export function getGrowReport(plantingId) {
  const planting = getPlantings().find((p) => p.id === plantingId)
  if (!planting) return null
  if (planting.status === 'finished' && planting.report) return planting.report
  const device = getDeviceForPlanting(plantingId)
  return buildGrowReport({
    planting,
    account: getAccount(),
    sensorMethod: device?.method ?? null,
    sensorHourly: device ? getSensorHourlyHistory(device.id) : [],
    todayStr: toDateStr(getNow()),
  })
}

// Archives the planting with a report snapshot, then releases its sensor
// (unpairing clears the hourly history the snapshot was built from).
export function finishPlanting(plantingId) {
  const finishedAt = toDateStr(getNow())
  updatePlanting(plantingId, (planting) => ({ ...planting, status: 'finished', finishedAt }))
  const report = getGrowReport(plantingId)
  updatePlanting(plantingId, (planting) => ({ ...planting, report }))
  unpairDevice(plantingId)
}

export function savePlanting(planting) {
  const plantings = readArray(PLANTINGS_KEY, [])
  writeJSON(PLANTINGS_KEY, [...plantings, planting])
}

export function removePlanting(id) {
  const plantings = readArray(PLANTINGS_KEY, [])
  writeJSON(
    PLANTINGS_KEY,
    plantings.filter((planting) => planting.id !== id),
  )
  unpairDevice(id)
  unshareReport(id)
}

// Log entries: { id, date, type ('note' | check-in type), text, photo }.
// Older entries only have { id, date, text }.
export function addPlantingNote(plantingId, entry) {
  const note = entry.id
    ? entry
    : { ...entry, id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
  const plantings = readArray(PLANTINGS_KEY, [])
  writeJSON(
    PLANTINGS_KEY,
    plantings.map((planting) =>
      planting.id === plantingId
        ? { ...planting, notes: [note, ...(Array.isArray(planting.notes) ? planting.notes : [])] }
        : planting,
    ),
  )
}

// ---- Planting weather history ----
// Daily min/max temperature (F) and precipitation (in), keyed by date. Past
// days overwrite earlier forecasts for the same date.

export function recordPlantingWeather(plantingId, days) {
  const plantings = readArray(PLANTINGS_KEY, [])
  // Real date, not getNow(): forecasts come from the live API.
  const today = toDateStr(new Date())
  let changed = false
  const next = plantings.map((planting) => {
    if (planting.id !== plantingId) return planting
    const history = { ...(planting.weatherHistory || {}) }
    days.forEach((day) => {
      const entry = { tMin: day.tMin, tMax: day.tMax, precip: day.precip, forecast: day.date > today }
      const prev = history[day.date]
      if (
        !prev ||
        prev.tMin !== entry.tMin ||
        prev.tMax !== entry.tMax ||
        prev.precip !== entry.precip ||
        prev.forecast !== entry.forecast
      ) {
        history[day.date] = entry
        changed = true
      }
    })
    return { ...planting, weatherHistory: history }
  })
  if (!changed) return
  try {
    writeJSON(PLANTINGS_KEY, next)
  } catch {
    // Storage full; weather history is a nice-to-have.
  }
}

// ---- Weather cache (per neighborhood) ----

export const WEATHER_CACHE_TTL_MS = 3 * 60 * 60 * 1000

export function getWeatherCache(neighborhoodKey) {
  const all = readJSON(WEATHER_CACHE_KEY, {})
  const entry = isPlainObject(all) ? all[neighborhoodKey] : null
  if (!entry || !Array.isArray(entry.days)) return null
  return { ...entry, fresh: Date.now() - entry.fetchedAt < WEATHER_CACHE_TTL_MS }
}

export function saveWeatherCache(neighborhoodKey, days) {
  const all = readJSON(WEATHER_CACHE_KEY, {})
  const next = isPlainObject(all) ? all : {}
  next[neighborhoodKey] = { fetchedAt: Date.now(), days }
  try {
    writeJSON(WEATHER_CACHE_KEY, next)
  } catch {
    // Storage full; the next visit will just refetch.
  }
}

// ---- Shared grow reports ----
// Shaped like a future `reports` table. Location is the neighborhood only,
// photos are never shared, and anonymous rows carry no display name.

export function getSharedReports() {
  return readArray(SHARED_REPORTS_KEY, [])
}

export function getSharedReportForPlanting(plantingId) {
  return getSharedReports().find((row) => row.plantingId === plantingId) ?? null
}

export function shareReport(plantingId, { anonymous }) {
  const report = getGrowReport(plantingId)
  if (!report) return null
  const account = getAccount()
  const existing = getSharedReportForPlanting(plantingId)
  const row = {
    id: existing?.id ?? `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    plantingId,
    authorId: getAuthorId(),
    authorName: anonymous ? null : account.displayName || null,
    crop: report.cropId,
    method: report.method,
    hood: report.neighborhoodKey,
    metrics: {
      ...report.metrics,
      datePlanted: report.datePlanted,
      firstHarvestDate: report.firstHarvestDate,
      finishedAt: report.finishedAt,
      daysToFirstHarvest: report.daysToFirstHarvest,
      harvestCount: report.harvestCount,
      problems: report.problems,
    },
    yield: report.yield,
    quality: report.averageQuality,
    notes: report.notes,
    sharedAt: new Date().toISOString(),
    anonymous: Boolean(anonymous),
  }
  const others = getSharedReports().filter((r) => r.plantingId !== plantingId)
  writeJSON(SHARED_REPORTS_KEY, [...others, row])
  return row
}

export function unshareReport(plantingId) {
  writeJSON(
    SHARED_REPORTS_KEY,
    getSharedReports().filter((row) => row.plantingId !== plantingId),
  )
}

// ---- Community Q&A ----
// Shaped like future `posts` and `answers` tables. Votes are keyed by author
// id so each person gets one vote per item; `reportedBy` works the same way.

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function currentAuthor() {
  const account = getAccount()
  return {
    authorId: getAuthorId(),
    authorName: account.displayName || null,
    authorHood: account.neighborhood || account.preferredNeighborhood || null,
    authorOrg: null,
  }
}

export function getCommunityPosts() {
  return readArray(COMMUNITY_POSTS_KEY, [])
}

function updateCommunityPost(postId, update) {
  writeJSON(
    COMMUNITY_POSTS_KEY,
    getCommunityPosts().map((post) => (post.id === postId ? update(post) : post)),
  )
}

// Applies `update` to the post itself, or to one of its answers.
function updateCommunityItem(postId, answerId, update) {
  updateCommunityPost(postId, (post) =>
    answerId
      ? { ...post, answers: post.answers.map((answer) => (answer.id === answerId ? update(answer) : answer)) }
      : update(post),
  )
}

// The attachment is a summary snapshot; later changes to the planting
// don't alter a question that was already asked.
export function getReportAttachment(plantingId) {
  const report = getGrowReport(plantingId)
  return report ? { ...summarizeReport(report), plantingId } : null
}

export function createCommunityPost({ title, body, photo, cropId, method, topic, plantingId }) {
  const post = {
    id: newId('post'),
    ...currentAuthor(),
    title,
    body,
    photo: photo ?? null,
    cropId: cropId || null,
    method: method || null,
    topic,
    report: plantingId ? getReportAttachment(plantingId) : null,
    createdAt: getNow().toISOString(),
    baseScore: 0,
    votes: {},
    reportedBy: [],
    acceptedAnswerId: null,
    answers: [],
    demo: false,
  }
  writeJSON(COMMUNITY_POSTS_KEY, [...getCommunityPosts(), post])
  return post
}

export function addCommunityAnswer(postId, body) {
  const answer = {
    id: newId('answer'),
    ...currentAuthor(),
    body,
    createdAt: getNow().toISOString(),
    baseScore: 0,
    votes: {},
    reportedBy: [],
    demo: false,
  }
  updateCommunityPost(postId, (post) => ({ ...post, answers: [...post.answers, answer] }))
  return answer
}

// value is 1 or -1; voting the same way again clears the vote.
export function voteCommunityItem(postId, answerId, value) {
  const authorId = getAuthorId()
  updateCommunityItem(postId, answerId, (item) => {
    const votes = { ...(item.votes ?? {}) }
    if (votes[authorId] === value) delete votes[authorId]
    else votes[authorId] = value
    return { ...item, votes }
  })
}

// Only the asker can accept; accepting the accepted answer un-accepts it.
export function acceptCommunityAnswer(postId, answerId) {
  const authorId = getAuthorId()
  updateCommunityPost(postId, (post) => {
    if (post.authorId !== authorId) return post
    return { ...post, acceptedAnswerId: post.acceptedAnswerId === answerId ? null : answerId }
  })
}

export function reportCommunityItem(postId, answerId) {
  const authorId = getAuthorId()
  updateCommunityItem(postId, answerId, (item) => {
    const reportedBy = item.reportedBy ?? []
    return reportedBy.includes(authorId) ? item : { ...item, reportedBy: [...reportedBy, authorId] }
  })
}

// ---- Sensor devices ----

export function getDevices() {
  return readArray(DEVICES_KEY, [])
}

export function getDeviceForPlanting(plantingId) {
  return getDevices().find((device) => device.plantingId === plantingId) ?? null
}

export function pairDevice({ plantingId, method }) {
  const devices = getDevices().filter((device) => device.plantingId !== plantingId)
  const sameMethodCount = devices.filter((device) => device.method === method).length
  const device = {
    id: `demo-${method}-${String(sameMethodCount + 1).padStart(2, '0')}`,
    plantingId,
    method,
    pairedAt: Date.now(),
    simulated: true,
  }
  writeJSON(DEVICES_KEY, [...devices, device])
  return device
}

export function unpairDevice(plantingId) {
  const devices = getDevices()
  const device = devices.find((d) => d.plantingId === plantingId)
  if (device) clearSensorHistory(device.id)
  writeJSON(
    DEVICES_KEY,
    devices.filter((d) => d.plantingId !== plantingId),
  )
}

// ---- Sensor hourly history ----
// Raw readings are kept in memory only (see src/services/sensors.js); this
// persists hourly min/max/avg per metric so charts survive a reload.

function hourBucketKey(timestamp) {
  const date = new Date(timestamp)
  date.setMinutes(0, 0, 0)
  return date.toISOString()
}

export function recordSensorReading(deviceId, reading) {
  const all = readJSON(SENSOR_HISTORY_KEY, {})
  const deviceHistory = all[deviceId] || {}
  const key = hourBucketKey(reading.timestamp)
  const bucket = deviceHistory[key] || { hour: key, metrics: {} }

  Object.entries(reading).forEach(([metric, value]) => {
    if (typeof value !== 'number') return
    const entry = bucket.metrics[metric] || { min: value, max: value, sum: 0, count: 0 }
    entry.min = Math.min(entry.min, value)
    entry.max = Math.max(entry.max, value)
    entry.sum += value
    entry.count += 1
    bucket.metrics[metric] = entry
  })

  deviceHistory[key] = bucket
  all[deviceId] = deviceHistory
  writeJSON(SENSOR_HISTORY_KEY, all)
}

export function getSensorHourlyHistory(deviceId) {
  const all = readJSON(SENSOR_HISTORY_KEY, {})
  const deviceHistory = all[deviceId] || {}
  return Object.values(deviceHistory)
    .map((bucket) => ({
      hour: bucket.hour,
      metrics: Object.fromEntries(
        Object.entries(bucket.metrics).map(([metric, entry]) => [
          metric,
          { min: entry.min, max: entry.max, avg: entry.sum / entry.count },
        ]),
      ),
    }))
    .sort((a, b) => (a.hour < b.hour ? -1 : 1))
}

export function clearSensorHistory(deviceId) {
  const all = readJSON(SENSOR_HISTORY_KEY, {})
  delete all[deviceId]
  writeJSON(SENSOR_HISTORY_KEY, all)
}

// ---- Account ----

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function getAccount() {
  const stored = readJSON(ACCOUNT_KEY, null)
  const merged = isPlainObject(stored) ? { ...DEFAULT_ACCOUNT, ...stored } : { ...DEFAULT_ACCOUNT }
  if (!merged.language) {
    merged.language = detectDefaultLanguage()
  }
  return merged
}

// Stable local id standing in for a future user id.
export function getAuthorId() {
  const account = getAccount()
  if (account.authorId) return account.authorId
  const authorId = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  updateAccount({ authorId })
  return authorId
}

export function updateAccount(patch) {
  const account = getAccount()
  writeJSON(ACCOUNT_KEY, { ...account, ...patch })
}

// ---- Demo tools ----

export function resetDemoData() {
  const realListings = readArray(LISTINGS_KEY, []).filter((listing) => !listing.demo)
  writeJSON(LISTINGS_KEY, [...realListings, ...buildDemoListings()])

  const demoEventListingIds = new Set(DEMO_INSIGHT_LISTINGS.map((listing) => listing.id))
  const realEvents = readArray(EVENTS_KEY, []).filter(
    (event) => !demoEventListingIds.has(event.listingId),
  )
  writeJSON(EVENTS_KEY, [...realEvents, ...buildDemoEvents()])

  localStorage.removeItem(COMMUNITY_SEEDED_KEY)
  ensureCommunitySeeded()
}

export function clearAllData() {
  localStorage.removeItem(LISTINGS_KEY)
  localStorage.removeItem(PLANTINGS_KEY)
  localStorage.removeItem(ACCOUNT_KEY)
  localStorage.removeItem(EVENTS_KEY)
  localStorage.removeItem(SEEDED_KEY)
  localStorage.removeItem(CONVERSATIONS_KEY)
  localStorage.removeItem(SELLER_RATINGS_KEY)
  localStorage.removeItem(DEVICES_KEY)
  localStorage.removeItem(SENSOR_HISTORY_KEY)
  localStorage.removeItem(WEATHER_CACHE_KEY)
  localStorage.removeItem(SHARED_REPORTS_KEY)
  localStorage.removeItem(COMMUNITY_POSTS_KEY)
  localStorage.removeItem(COMMUNITY_SEEDED_KEY)
  ensureSeeded()
  ensureCommunitySeeded()
}

// ---- Analytics events ----

function recordEvent(type, listingId, label) {
  if (!listingId) return
  const events = readArray(EVENTS_KEY, [])
  events.push({
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    listingId,
    label,
    date: toDateStr(getNow()),
  })
  writeJSON(EVENTS_KEY, events)
}

export function recordListingView(listingId, label) {
  recordEvent('view', listingId, label)
}

export function recordMessageTap(listingId, label) {
  recordEvent('message', listingId, label)
}

export function recordSearchMatch(listingId, label) {
  recordEvent('search', listingId, label)
}

export function getListingViewCount(listingId) {
  return readArray(EVENTS_KEY, []).filter(
    (event) => event.type === 'view' && event.listingId === listingId,
  ).length
}

const INSIGHTS_WINDOW_DAYS = 7

export function getInsights(now = getNow()) {
  const events = readArray(EVENTS_KEY, [])
  const days = []
  for (let offset = INSIGHTS_WINDOW_DAYS - 1; offset >= 0; offset--) {
    days.push(toDateStr(addDays(now, -offset)))
  }
  const daySet = new Set(days)

  const weekViews = events.filter((event) => event.type === 'view' && daySet.has(event.date))
  const weekMessages = events.filter((event) => event.type === 'message' && daySet.has(event.date))

  const dailyViews = days.map((date) => ({
    date,
    count: weekViews.filter((event) => event.date === date).length,
  }))

  const byListing = new Map()
  weekViews.forEach((event) => {
    if (!byListing.has(event.listingId)) {
      byListing.set(event.listingId, { listingId: event.listingId, label: event.label, views: 0 })
    }
    byListing.get(event.listingId).views += 1
  })
  const topListings = [...byListing.values()].sort((a, b) => b.views - a.views).slice(0, 3)

  return {
    totalViews: weekViews.length,
    messageTaps: weekMessages.length,
    topListings,
    dailyViews,
  }
}

// ---- Messaging ----

function buildListingSnapshot(listing) {
  return {
    cropId: listing.cropId ?? null,
    cropName: listing.cropName ?? null,
    price: listing.price,
    unit: listing.unit,
    snap: Boolean(listing.snap),
    photo: listing.photo ?? null,
    availableUntil: listing.availableUntil ?? null,
    datePlanted: listing.datePlanted ?? null,
    sellerType: listing.sellerType,
    demo: Boolean(listing.demo),
    sellerRating: listing.sellerRating ?? null,
    sellerReviewCount: listing.sellerReviewCount ?? null,
  }
}

function pickDemoBuyerName() {
  return DEMO_BUYER_NAMES[Math.floor(Math.random() * DEMO_BUYER_NAMES.length)]
}

function nowTimeStr() {
  const now = getNow()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function getConversations() {
  return readArray(CONVERSATIONS_KEY, [])
}

function saveConversations(list) {
  writeJSON(CONVERSATIONS_KEY, list)
}

export function findConversationByListingId(listingId) {
  return getConversations().find((conv) => conv.listingId === listingId) ?? null
}

export function findOrCreateConversation({ listing, role, lang = 'en' }) {
  const conversations = getConversations()
  const existing = conversations.find((conv) => conv.listingId === listing.id)
  if (existing) return existing

  const conv = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    listingId: listing.id,
    role,
    otherPartyName:
      role === 'buying' ? listing.displayName || t(lang, 'messaging.defaultSeller') : pickDemoBuyerName(),
    listingSnapshot: buildListingSnapshot(listing),
    messages: [],
    unreadCount: 0,
    rating: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  conversations.push(conv)
  saveConversations(conversations)
  return conv
}

export function appendMessage(conversationId, sender, text) {
  const conversations = getConversations()
  const conv = conversations.find((c) => c.id === conversationId)
  if (!conv) return null
  const message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    time: nowTimeStr(),
  }
  conv.messages.push(message)
  conv.updatedAt = Date.now()
  if (sender === 'them') conv.unreadCount = (conv.unreadCount || 0) + 1
  saveConversations(conversations)
  return message
}

export function markConversationRead(conversationId) {
  const conversations = getConversations()
  const conv = conversations.find((c) => c.id === conversationId)
  if (!conv || !conv.unreadCount) return
  conv.unreadCount = 0
  saveConversations(conversations)
}

export function getTotalUnreadCount() {
  return getConversations().reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
}

function seedInboundInquiry(listing, lang) {
  const existing = findConversationByListingId(listing.id)
  if (existing) return
  const conv = findOrCreateConversation({ listing, role: 'selling', lang })
  const crop = listing.cropName || (listing.cropId ? t(lang, `crops.${listing.cropId}`) : '')
  appendMessage(conv.id, 'them', t(lang, 'messaging.demoInquiry', { crop }))
}

export function rateSeller(sellerName, stars, baselineListing) {
  const all = readJSON(SELLER_RATINGS_KEY, {})
  let entry = all[sellerName]
  if (!entry) {
    const baselineAvg = baselineListing?.sellerRating
    const baselineCount = baselineListing?.sellerReviewCount ?? 0
    entry =
      baselineAvg != null
        ? { total: baselineAvg * baselineCount, count: baselineCount }
        : { total: 0, count: 0 }
  }
  entry.total += stars
  entry.count += 1
  all[sellerName] = entry
  writeJSON(SELLER_RATINGS_KEY, all)
}

export function getSellerRating(listing) {
  const all = readJSON(SELLER_RATINGS_KEY, {})
  const entry = all[listing.displayName]
  if (entry && entry.count > 0) {
    return { average: entry.total / entry.count, count: entry.count }
  }
  if (listing.sellerRating != null) {
    return { average: listing.sellerRating, count: listing.sellerReviewCount ?? 0 }
  }
  return null
}

export function rateConversationSeller(conversationId, stars, comment) {
  const conversations = getConversations()
  const conv = conversations.find((c) => c.id === conversationId)
  if (!conv) return
  conv.rating = { stars, comment: comment || '' }
  saveConversations(conversations)
  rateSeller(conv.otherPartyName, stars, conv.listingSnapshot)
}
