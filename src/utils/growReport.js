import { daysBetween, toDateStr } from './dates'
import { getRange } from './sensorRanges'
import { isOutdoorPlanting, plantingNeighborhoodKey } from './plantings'
import { FROST_F } from './weatherAlerts'

export const HARVEST_UNITS = ['lb', 'oz', 'count', 'bunches']
export const HYDRO_REPORT_METRICS = ['ph', 'ec', 'waterTemp']
export const PROBLEM_TYPES = ['pests', 'yellowing']

function round(value, digits = 1) {
  if (value == null || Number.isNaN(value)) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function average(values) {
  const clean = values.filter((value) => typeof value === 'number' && !Number.isNaN(value))
  if (clean.length === 0) return null
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

function inWindow(dateStr, startStr, endStr) {
  return dateStr >= startStr && dateStr <= endStr
}

// Hourly buckets -> per-day stats for one metric. A day counts as out of
// range when any hourly average fell outside the crop's range.
function summarizeSensorMetric(hourly, metric, range, startStr, endStr) {
  const byDay = new Map()
  hourly.forEach((bucket) => {
    const stats = bucket.metrics[metric]
    if (!stats) return
    const date = toDateStr(new Date(bucket.hour))
    if (!inWindow(date, startStr, endStr)) return
    if (!byDay.has(date)) byDay.set(date, [])
    byDay.get(date).push(stats)
  })
  if (byDay.size === 0) return null

  const days = [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
  const all = days.flatMap(([, buckets]) => buckets)
  const daysOutOfRange = range
    ? days.filter(([, buckets]) => buckets.some((stats) => stats.avg < range[0] || stats.avg > range[1])).length
    : null

  return {
    avg: round(average(all.map((stats) => stats.avg)), 2),
    min: round(Math.min(...all.map((stats) => stats.min)), 2),
    max: round(Math.max(...all.map((stats) => stats.max)), 2),
    range,
    daysOutOfRange,
    daysTracked: days.length,
    daily: days.map(([date, buckets]) => ({ date, value: round(average(buckets.map((stats) => stats.avg)), 2) })),
  }
}

function summarizeWeather(weatherHistory, startStr, endStr) {
  const days = Object.entries(weatherHistory || {})
    .filter(([date, day]) => !day.forecast && inWindow(date, startStr, endStr))
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, day]) => ({ date, ...day }))
  if (days.length === 0) return null

  return {
    daysTracked: days.length,
    totalRain: round(days.reduce((sum, day) => sum + (day.precip ?? 0), 0), 2),
    avgHigh: round(average(days.map((day) => day.tMax))),
    avgLow: round(average(days.map((day) => day.tMin))),
    frostNights: days.filter((day) => day.tMin <= FROST_F).length,
    daily: days.map((day) => ({ date: day.date, rain: day.precip ?? 0, high: day.tMax, low: day.tMin })),
  }
}

function summarizeYield(harvests) {
  const totals = new Map()
  harvests.forEach((harvest) => {
    totals.set(harvest.unit, (totals.get(harvest.unit) ?? 0) + harvest.amount)
  })
  return HARVEST_UNITS.filter((unit) => totals.has(unit)).map((unit) => ({ unit, amount: round(totals.get(unit), 2) }))
}

// Builds a Grow Report from what is stored for a planting. `sensorMethod`
// and `sensorHourly` come from the paired device (or a finished snapshot).
export function buildGrowReport({ planting, account, sensorMethod = null, sensorHourly = [], todayStr }) {
  const harvests = [...(planting.harvests ?? [])].sort((a, b) => (a.date < b.date ? -1 : 1))
  const log = planting.notes ?? []
  const startStr = planting.datePlanted
  const endStr = planting.finishedAt ?? todayStr

  const firstHarvest = harvests[0] ?? null
  const qualities = harvests.map((harvest) => harvest.quality).filter((quality) => quality != null)

  const metrics = { sensorMethod }
  if (sensorMethod === 'hydro') {
    metrics.hydro = Object.fromEntries(
      HYDRO_REPORT_METRICS.map((metric) => [
        metric,
        summarizeSensorMetric(sensorHourly, metric, getRange(planting.cropId, 'hydro', metric), startStr, endStr),
      ]),
    )
  }
  if (sensorMethod === 'soil') {
    metrics.soilMoisture = summarizeSensorMetric(
      sensorHourly,
      'soilMoisture',
      getRange(planting.cropId, 'soil', 'soilMoisture'),
      startStr,
      endStr,
    )
  }
  if (isOutdoorPlanting(planting)) {
    metrics.waterings = log.filter((entry) => entry.type === 'watered').length
    metrics.weather = summarizeWeather(planting.weatherHistory, startStr, endStr)
  }

  return {
    plantingId: planting.id,
    cropId: planting.cropId,
    method: planting.method,
    neighborhoodKey: isOutdoorPlanting(planting) ? plantingNeighborhoodKey(planting, account) : null,
    datePlanted: planting.datePlanted,
    firstHarvestDate: firstHarvest?.date ?? null,
    lastHarvestDate: harvests.at(-1)?.date ?? null,
    finishedAt: planting.finishedAt ?? null,
    daysToFirstHarvest: firstHarvest ? daysBetween(planting.datePlanted, firstHarvest.date) : null,
    harvestCount: harvests.length,
    yield: summarizeYield(harvests),
    averageQuality: round(average(qualities)),
    harvestSeries: harvests.map((harvest) => ({ date: harvest.date, amount: harvest.amount, unit: harvest.unit })),
    metrics,
    problems: Object.fromEntries(
      PROBLEM_TYPES.map((type) => [type, log.filter((entry) => entry.type === type).length]),
    ),
    notes: harvests.map((harvest) => harvest.changeNextTime).filter(Boolean),
  }
}

// ---- Report summaries ----
// A compact, chart-free shape shared by post attachments and shared-report
// cards, so one component can render either.

function withoutDaily(stats) {
  if (!stats) return null
  // eslint-disable-next-line no-unused-vars
  const { daily, ...rest } = stats
  return rest
}

function summarizeMetrics(metrics = {}) {
  return {
    hydro: metrics.hydro
      ? Object.fromEntries(Object.entries(metrics.hydro).map(([metric, stats]) => [metric, withoutDaily(stats)]))
      : null,
    soilMoisture: withoutDaily(metrics.soilMoisture),
    waterings: metrics.waterings ?? null,
    weather: withoutDaily(metrics.weather),
  }
}

export function summarizeReport(report) {
  return {
    cropId: report.cropId,
    method: report.method,
    neighborhoodKey: report.neighborhoodKey,
    datePlanted: report.datePlanted,
    finishedAt: report.finishedAt,
    daysToFirstHarvest: report.daysToFirstHarvest,
    harvestCount: report.harvestCount,
    yield: report.yield,
    averageQuality: report.averageQuality,
    problems: report.problems,
    notes: report.notes,
    ...summarizeMetrics(report.metrics),
  }
}

// Shared rows (see shareReport in the store) keep dates and counts inside
// `metrics`; lift them back out.
export function summarizeSharedRow(row) {
  const metrics = row.metrics ?? {}
  return {
    cropId: row.crop,
    method: row.method,
    neighborhoodKey: row.hood,
    datePlanted: metrics.datePlanted ?? null,
    finishedAt: metrics.finishedAt ?? null,
    daysToFirstHarvest: metrics.daysToFirstHarvest ?? null,
    harvestCount: metrics.harvestCount ?? 0,
    yield: row.yield ?? [],
    averageQuality: row.quality ?? null,
    problems: metrics.problems ?? {},
    notes: row.notes ?? [],
    ...summarizeMetrics(metrics),
  }
}
