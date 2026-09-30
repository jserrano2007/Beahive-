import { LOCALES } from '../i18n/locales'

export function parseDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatShortDate(dateStr, lang = 'en') {
  const date = parseDateStr(dateStr)
  const dict = LOCALES[lang] ?? LOCALES.en
  const month = dict.monthsShort[date.getMonth()]
  const day = date.getDate()
  return lang === 'es' ? `${day} ${month}` : `${month} ${day}`
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function daysBetween(fromDateStr, toDateStrValue) {
  return Math.round((parseDateStr(toDateStrValue) - parseDateStr(fromDateStr)) / MS_PER_DAY)
}

export function formatClockTime(date) {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = hours >= 12 ? 'pm' : 'am'
  hours %= 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes}${suffix}`
}
