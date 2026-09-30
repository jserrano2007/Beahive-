import { addDays, daysBetween, formatShortDate, parseDateStr, toDateStr } from './dates'
import { LOCALES } from '../i18n/locales'
import { interpolate } from '../i18n/interpolate'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const WEEK_ORDER_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function dict(lang) {
  return LOCALES[lang] ?? LOCALES.en
}

function t(lang, key, vars) {
  const raw = dict(lang)[key] ?? LOCALES.en[key] ?? key
  return interpolate(raw, vars)
}

export function getWeekOrder(lang = 'en') {
  const weekdaysFull = dict(lang).weekdaysFull
  return WEEK_ORDER_KEYS.map((key) => ({
    key,
    label: weekdaysFull[DAY_KEYS.indexOf(key)],
  }))
}

export function getNow() {
  if (typeof window !== 'undefined') {
    const nowParam = new URLSearchParams(window.location.search).get('now')
    if (nowParam) {
      const parsed = new Date(nowParam)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
  }
  return new Date()
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(hhmm, lang = 'en') {
  const [hStr, mStr] = hhmm.split(':')
  let h = Number(hStr)
  const m = Number(mStr)
  const isPM = h >= 12
  h = h % 12 || 12
  const minutePart = m === 0 ? '' : `:${String(m).padStart(2, '0')}`
  if (lang === 'es') {
    return `${h}${minutePart} ${isPM ? 'p. m.' : 'a. m.'}`
  }
  return `${h}${minutePart}${isPM ? 'pm' : 'am'}`
}

function dateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function inSeason(season, now) {
  if (!season) return true
  const today = dateStr(now)
  return today >= season.start && today <= season.end
}

export function getTodayKey(now = getNow()) {
  return DAY_KEYS[now.getDay()]
}

export function formatDayRanges(ranges, lang = 'en') {
  if (!ranges || ranges.length === 0) return t(lang, 'hours.closed')
  return ranges
    .map(([start, end]) => `${formatTime(start, lang)}–${formatTime(end, lang)}`)
    .join(', ')
}

export function isOpenNow(source, now = getNow()) {
  if (!source.hours) return false
  if (!inSeason(source.season, now)) return false

  const todayRanges = source.hours[DAY_KEYS[now.getDay()]] ?? []
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return todayRanges.some(
    ([start, end]) => nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end),
  )
}

export function getStatusLine(source, now = getNow(), lang = 'en') {
  if (!source.hours) return { text: t(lang, 'hours.hoursNotListed'), open: false }
  if (!inSeason(source.season, now)) return { text: t(lang, 'hours.outOfSeason'), open: false }

  const dayIndex = now.getDay()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const todayRanges = source.hours[DAY_KEYS[dayIndex]] ?? []

  const activeRange = todayRanges.find(
    ([start, end]) => nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end),
  )
  if (activeRange) {
    return { text: t(lang, 'hours.openUntil', { time: formatTime(activeRange[1], lang) }), open: true }
  }

  const nextToday = todayRanges
    .filter(([start]) => toMinutes(start) > nowMinutes)
    .sort((a, b) => toMinutes(a[0]) - toMinutes(b[0]))[0]
  if (nextToday) {
    return {
      text: t(lang, 'hours.opensTodayAt', { time: formatTime(nextToday[0], lang) }),
      open: false,
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const dayKey = DAY_KEYS[(dayIndex + offset) % 7]
    const ranges = source.hours[dayKey]
    if (ranges && ranges.length > 0) {
      const earliest = [...ranges].sort((a, b) => toMinutes(a[0]) - toMinutes(b[0]))[0]
      const weekday = dict(lang).weekdaysFull[(dayIndex + offset) % 7]
      return {
        text: t(lang, 'hours.nextOpen', { weekday, time: formatTime(earliest[0], lang) }),
        open: false,
      }
    }
  }

  return { text: t(lang, 'hours.hoursNotListed'), open: false }
}

const OPENS_NEXT_LOOKAHEAD_DAYS = 7

function formatOpensNextText(offset, time, date, lang) {
  if (offset === 0) return t(lang, 'hours.opensTodayAt', { time: formatTime(time, lang) })
  if (offset === 1) return t(lang, 'hours.opensTomorrowAt', { time: formatTime(time, lang) })
  const weekday = dict(lang).weekdaysFull[date.getDay()]
  return t(lang, 'hours.nextOpen', { weekday, time: formatTime(time, lang) })
}

export function getNextOpening(source, now = getNow(), lang = 'en') {
  if (!source.hours) return null

  for (let offset = 0; offset <= OPENS_NEXT_LOOKAHEAD_DAYS; offset++) {
    const date = addDays(now, offset)
    if (!inSeason(source.season, date)) continue

    const ranges = source.hours[DAY_KEYS[date.getDay()]]
    if (!ranges || ranges.length === 0) continue

    const sorted = [...ranges].sort((a, b) => toMinutes(a[0]) - toMinutes(b[0]))
    for (const [start] of sorted) {
      const [h, m] = start.split(':').map(Number)
      const openingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
      if (openingDate > now) {
        return { date: openingDate, offset, text: formatOpensNextText(offset, start, date, lang) }
      }
    }
  }

  return null
}

const SEASON_ENDING_SOON_DAYS = 30

export function getSeasonInfo(season, now = getNow(), lang = 'en') {
  if (!season) return { label: null, inSeason: true }

  if (inSeason(season, now)) {
    const daysUntilEnd = daysBetween(toDateStr(now), season.end)
    if (daysUntilEnd <= SEASON_ENDING_SOON_DAYS) {
      return {
        label: t(lang, 'hours.seasonEnds', { date: formatShortDate(season.end, lang) }),
        inSeason: true,
      }
    }
    return { label: null, inSeason: true }
  }

  let nextStart = parseDateStr(season.start)
  const todayDateOnly = parseDateStr(toDateStr(now))
  if (nextStart < todayDateOnly) {
    nextStart = new Date(nextStart.getFullYear() + 1, nextStart.getMonth(), nextStart.getDate())
  }
  return {
    label: t(lang, 'hours.seasonStarts', { date: formatShortDate(toDateStr(nextStart), lang) }),
    inSeason: false,
  }
}
