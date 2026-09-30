import ranges from '../data/ranges.json'

export function getRange(cropId, method, metric) {
  const cropOverride = ranges.crops?.[cropId]?.[method]?.[metric]
  if (cropOverride) return cropOverride
  return ranges.defaults?.[method]?.[metric] ?? null
}

export function getMetricStatus(value, range) {
  if (!range || value == null || Number.isNaN(value)) return 'unknown'
  const [min, max] = range
  const margin = (max - min) * 0.15
  if (value >= min && value <= max) return 'good'
  if (value >= min - margin && value <= max + margin) return 'watch'
  return 'bad'
}
