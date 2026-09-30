import { useEffect, useState } from 'react'
import { subscribe, getStatus } from '../services/sensors'
import { recordSensorReading } from '../data/store'

const EMPTY_STATUS = {
  reading: null,
  history: [],
  online: false,
  offlineSince: null,
  lastUpdatedAt: null,
  scenario: 'healthy',
}

function toHookState(status) {
  return {
    reading: status.lastReading,
    history: status.history,
    online: status.online,
    offlineSince: status.offlineSince,
    lastUpdatedAt: status.lastUpdatedAt,
    scenario: status.scenario,
  }
}

export function useSensor(deviceId) {
  const [trackedDeviceId, setTrackedDeviceId] = useState(deviceId)
  const [state, setState] = useState(() => (deviceId ? toHookState(getStatus(deviceId)) : EMPTY_STATUS))

  if (deviceId !== trackedDeviceId) {
    setTrackedDeviceId(deviceId)
    setState(deviceId ? toHookState(getStatus(deviceId)) : EMPTY_STATUS)
  }

  useEffect(() => {
    if (!deviceId) return undefined
    let lastRecordedTimestamp = null
    const unsubscribe = subscribe(deviceId, (reading) => {
      setState(toHookState(getStatus(deviceId)))
      if (reading && reading.timestamp !== lastRecordedTimestamp) {
        lastRecordedTimestamp = reading.timestamp
        recordSensorReading(deviceId, reading)
      }
    })
    return unsubscribe
  }, [deviceId])

  return state
}
