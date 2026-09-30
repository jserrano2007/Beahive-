import { daysBetween } from './dates'

// A crop + method needs this many shared harvests before we compare them.
export const MIN_REPORTS_FOR_INSIGHT = 3

// Yields are only comparable within one kind of unit.
const YIELD_KINDS = {
  weight: (y) => (y.unit === 'lb' ? y.amount : y.unit === 'oz' ? y.amount / 16 : null),
  count: (y) => (y.unit === 'count' ? y.amount : null),
  bunches: (y) => (y.unit === 'bunches' ? y.amount : null),
}

export function yieldIn(summary, kind) {
  const values = (summary.yield ?? []).map(YIELD_KINDS[kind]).filter((value) => value != null)
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : null
}

function mostCommonYieldKind(summaries) {
  const counts = Object.keys(YIELD_KINDS).map((kind) => ({
    kind,
    count: summaries.filter((summary) => yieldIn(summary, kind) != null).length,
  }))
  counts.sort((a, b) => b.count - a.count)
  return counts[0].count > 0 ? counts[0].kind : null
}

function wateringsPerWeek(summary) {
  if (summary.waterings == null || !summary.datePlanted || !summary.finishedAt) return null
  const weeks = daysBetween(summary.datePlanted, summary.finishedAt) / 7
  return weeks >= 1 ? summary.waterings / weeks : null
}

// What we compare between the top third and the rest. `minGap` keeps noise
// out: the rest's average has to sit at least that far outside the top
// group's range. `only` limits a factor to the direction that reads as advice.
const FACTORS = [
  { key: 'ph', get: (s) => s.hydro?.ph?.avg, minGap: 0.1 },
  { key: 'ec', get: (s) => s.hydro?.ec?.avg, minGap: 0.1 },
  { key: 'waterTemp', get: (s) => s.hydro?.waterTemp?.avg, minGap: 0.5 },
  { key: 'soilMoisture', get: (s) => s.soilMoisture?.avg, minGap: 3 },
  { key: 'wateringsPerWeek', get: wateringsPerWeek, minGap: 0.3 },
  { key: 'pests', get: (s) => s.problems?.pests, minGap: 0.5, only: 'below' },
]

const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value)
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length

function compareFactor(factor, top, rest) {
  const topValues = top.map(factor.get).filter(isNumber)
  const restValues = rest.map(factor.get).filter(isNumber)
  if (topValues.length === 0 || restValues.length === 0) return null
  const min = Math.min(...topValues)
  const max = Math.max(...topValues)
  const restAvg = mean(restValues)
  let direction = null
  if (restAvg - max >= factor.minGap) direction = 'below'
  else if (min - restAvg >= factor.minGap) direction = 'above'
  if (!direction || (factor.only && factor.only !== direction)) return null
  return { key: factor.key, direction, min, max, restAvg }
}

export function groupKey(summary) {
  return `${summary.cropId}|${summary.method}`
}

// Compares the top third by yield against everyone else for one crop +
// method. Returns null until there are enough comparable harvests.
export function whatWorked(summaries) {
  const kind = mostCommonYieldKind(summaries)
  if (!kind) return null
  const ranked = summaries
    .filter((summary) => yieldIn(summary, kind) != null)
    .sort((a, b) => yieldIn(b, kind) - yieldIn(a, kind))
  if (ranked.length < MIN_REPORTS_FOR_INSIGHT) return null

  const topCount = Math.ceil(ranked.length / 3)
  const top = ranked.slice(0, topCount)
  const rest = ranked.slice(topCount)

  return {
    cropId: ranked[0].cropId,
    method: ranked[0].method,
    sampleSize: ranked.length,
    topCount,
    yieldKind: kind,
    topAvgYield: mean(top.map((s) => yieldIn(s, kind))),
    restAvgYield: mean(rest.map((s) => yieldIn(s, kind))),
    findings: FACTORS.map((factor) => compareFactor(factor, top, rest)).filter(Boolean),
  }
}

// One insight per crop + method with enough reports, biggest samples first.
export function buildInsights(summaries) {
  const groups = new Map()
  summaries.forEach((summary) => {
    const key = groupKey(summary)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(summary)
  })
  return [...groups.values()]
    .map(whatWorked)
    .filter(Boolean)
    .sort((a, b) => b.sampleSize - a.sampleSize)
}
