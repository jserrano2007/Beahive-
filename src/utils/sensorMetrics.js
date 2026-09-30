export const HYDRO_METRICS = ['ph', 'ec', 'waterTemp', 'waterLevel', 'airTemp', 'humidity']
export const SOIL_METRICS = ['soilMoisture', 'soilTemp', 'airTemp', 'humidity']

const METRIC_UNITS = {
  ph: '',
  ec: ' mS/cm',
  waterTemp: '°C',
  waterLevel: '%',
  soilMoisture: '%',
  soilTemp: '°C',
  airTemp: '°C',
  humidity: '%',
  lux: ' lux',
}

export function metricsForMethod(method) {
  return method === 'hydro' ? HYDRO_METRICS : SOIL_METRICS
}

export function defaultSensorMethodFor(plantingMethod) {
  return plantingMethod === 'Hydroponic' ? 'hydro' : 'soil'
}

export function formatMetricValue(metric, value) {
  if (value == null || Number.isNaN(value)) return '—'
  const unit = METRIC_UNITS[metric] ?? ''
  if (metric === 'ph' || metric === 'ec') return `${value.toFixed(2)}${unit}`
  if (metric === 'lux') return `${Math.round(value)}${unit}`
  return `${value.toFixed(1)}${unit}`
}
