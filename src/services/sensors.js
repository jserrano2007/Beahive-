// Simulated sensor source. A real integration would replace only this file:
// it must keep exposing subscribe(deviceId, callback) and getStatus(deviceId).
// Everything else here (scenarios, offline toggle) is simulator-only demo
// tooling and is never touched by the UI when reading.simulated is false.

const READING_INTERVAL_MS = 5000
const HISTORY_HOURS = 24
const MAX_RAW_READINGS = 50

export const SCENARIOS = {
  hydro: ['healthy', 'ph-drift', 'running-dry'],
  soil: ['healthy', 'heat-stress', 'running-dry'],
}

const TARGETS = {
  hydro: { ph: 6.0, ec: 1.4, waterTemp: 20.5, waterLevel: 90, airTemp: 23, humidity: 55, lux: 8000 },
  soil: { soilMoisture: 55, soilTemp: 18.5, airTemp: 23, humidity: 55, lux: 8000 },
}

const devices = new Map()

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function randomWalk(value, target, step, min, max) {
  const pull = (target - value) * 0.08
  const noise = (Math.random() - 0.5) * step
  return clamp(value + pull + noise, min, max)
}

function methodForDevice(deviceId) {
  return deviceId.includes('soil') ? 'soil' : 'hydro'
}

function createValues(method) {
  const target = TARGETS[method]
  return method === 'hydro'
    ? {
        ph: target.ph,
        ec: target.ec,
        waterTemp: target.waterTemp,
        waterLevel: target.waterLevel,
        airTemp: target.airTemp,
        humidity: target.humidity,
        lux: target.lux,
      }
    : {
        soilMoisture: target.soilMoisture,
        soilTemp: target.soilTemp,
        airTemp: target.airTemp,
        humidity: target.humidity,
        lux: target.lux,
      }
}

function stepValues(method, scenario, values) {
  const target = TARGETS[method]
  const next = { ...values }

  if (method === 'hydro') {
    next.ph =
      scenario === 'ph-drift'
        ? clamp(values.ph + 0.06 + (Math.random() - 0.5) * 0.02, 4, 9)
        : randomWalk(values.ph, target.ph, 0.05, 4, 9)
    next.ec = randomWalk(values.ec, target.ec, 0.05, 0, 5)
    next.waterTemp = randomWalk(values.waterTemp, target.waterTemp, 0.3, 5, 35)
    next.waterLevel =
      scenario === 'running-dry'
        ? clamp(values.waterLevel - 3 - Math.random(), 0, 100)
        : randomWalk(values.waterLevel, target.waterLevel, 1, 0, 100)
  } else {
    next.soilMoisture =
      scenario === 'running-dry'
        ? clamp(values.soilMoisture - 3 - Math.random(), 0, 100)
        : randomWalk(values.soilMoisture, target.soilMoisture, 1.5, 0, 100)
    next.soilTemp = randomWalk(values.soilTemp, target.soilTemp, 0.3, 0, 40)
  }

  next.airTemp =
    scenario === 'heat-stress'
      ? clamp(values.airTemp + (32 - values.airTemp) * 0.15 + Math.random() * 0.3, 10, 42)
      : randomWalk(values.airTemp, target.airTemp, 0.4, 5, 40)
  next.humidity = randomWalk(values.humidity, target.humidity, 1.5, 20, 95)
  next.lux = clamp(target.lux + (Math.random() - 0.5) * 2000, 0, 20000)

  return next
}

function buildReading(deviceId, method, scenario, values, timestamp) {
  const reading = {
    deviceId,
    method,
    scenario,
    simulated: true,
    timestamp,
    airTemp: round1(values.airTemp),
    humidity: round1(values.humidity),
    lux: Math.round(values.lux),
  }
  if (method === 'hydro') {
    reading.ph = round2(values.ph)
    reading.ec = round2(values.ec)
    reading.waterTemp = round1(values.waterTemp)
    reading.waterLevel = round1(values.waterLevel)
  } else {
    reading.soilMoisture = round1(values.soilMoisture)
    reading.soilTemp = round1(values.soilTemp)
  }
  return reading
}

function backfillHistory(deviceId, method) {
  let values = createValues(method)
  const points = []
  const now = Date.now()
  for (let hoursAgo = HISTORY_HOURS; hoursAgo >= 1; hoursAgo--) {
    values = stepValues(method, 'healthy', values)
    points.push(buildReading(deviceId, method, 'healthy', values, now - hoursAgo * 3600 * 1000))
  }
  return { points, values }
}

function getOrCreateDevice(deviceId) {
  let device = devices.get(deviceId)
  if (!device) {
    const method = methodForDevice(deviceId)
    const { points, values } = backfillHistory(deviceId, method)
    device = {
      method,
      scenario: 'healthy',
      offline: false,
      offlineSinceAt: null,
      values,
      history: points,
      lastReading: points[points.length - 1] ?? null,
      lastUpdatedAt: Date.now(),
      subscribers: new Set(),
      timer: null,
    }
    devices.set(deviceId, device)
  }
  return device
}

function notify(deviceId) {
  const device = devices.get(deviceId)
  if (!device) return
  device.subscribers.forEach((callback) => callback(device.lastReading))
}

function tick(deviceId) {
  const device = devices.get(deviceId)
  if (!device || device.offline) return
  device.values = stepValues(device.method, device.scenario, device.values)
  const reading = buildReading(deviceId, device.method, device.scenario, device.values, Date.now())
  device.lastReading = reading
  device.lastUpdatedAt = Date.now()
  device.history.push(reading)
  if (device.history.length > MAX_RAW_READINGS) device.history.shift()
  notify(deviceId)
}

function ensureTimer(deviceId) {
  const device = devices.get(deviceId)
  if (!device || device.timer) return
  device.timer = setInterval(() => tick(deviceId), READING_INTERVAL_MS)
}

/** Subscribe to live readings for a device. Returns an unsubscribe function. */
export function subscribe(deviceId, callback) {
  const device = getOrCreateDevice(deviceId)
  device.subscribers.add(callback)
  ensureTimer(deviceId)
  return function unsubscribe() {
    device.subscribers.delete(callback)
    if (device.subscribers.size === 0 && device.timer) {
      clearInterval(device.timer)
      device.timer = null
    }
  }
}

/** Current status snapshot for a device: reading, recent raw history, online state. */
export function getStatus(deviceId) {
  const device = getOrCreateDevice(deviceId)
  return {
    online: !device.offline,
    lastReading: device.lastReading,
    history: device.history,
    lastUpdatedAt: device.lastUpdatedAt,
    offlineSince: device.offlineSinceAt,
    scenario: device.scenario,
  }
}

// ---- Simulator-only demo controls ----

export function setScenario(deviceId, scenario) {
  const device = devices.get(deviceId)
  if (!device) return
  device.scenario = scenario
  notify(deviceId)
}

export function setOffline(deviceId, offline) {
  const device = devices.get(deviceId)
  if (!device) return
  device.offline = offline
  device.offlineSinceAt = offline ? Date.now() : null
  notify(deviceId)
}
