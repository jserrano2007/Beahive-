import { getRange, getMetricStatus } from './sensorRanges'

function evalMetric(cropId, method, reading, metric) {
  const range = getRange(cropId, method, metric)
  const value = reading[metric]
  if (value == null || !range) return null
  return { range, value, status: getMetricStatus(value, range) }
}

export function buildSensorAlerts({ t, method, cropId, cropLabel, reading }) {
  if (!reading) return []
  const alerts = []

  if (method === 'hydro') {
    const ph = evalMetric(cropId, method, reading, 'ph')
    if (ph?.status === 'bad') {
      alerts.push({
        id: 'ph',
        text:
          ph.value > ph.range[1]
            ? t('garden.sensor.alert.phHigh', { value: ph.value.toFixed(1), crop: cropLabel })
            : t('garden.sensor.alert.phLow', { value: ph.value.toFixed(1), crop: cropLabel }),
      })
    }

    const ec = evalMetric(cropId, method, reading, 'ec')
    if (ec?.status === 'bad') {
      alerts.push({
        id: 'ec',
        text:
          ec.value > ec.range[1]
            ? t('garden.sensor.alert.ecHigh', { value: ec.value.toFixed(1), crop: cropLabel })
            : t('garden.sensor.alert.ecLow', { value: ec.value.toFixed(1), crop: cropLabel }),
      })
    }

    const waterLevel = evalMetric(cropId, method, reading, 'waterLevel')
    if (waterLevel?.status === 'bad' && waterLevel.value < waterLevel.range[0]) {
      alerts.push({
        id: 'waterLevel',
        text: t('garden.sensor.alert.waterLow', { value: Math.round(waterLevel.value) }),
      })
    }

    const waterTemp = evalMetric(cropId, method, reading, 'waterTemp')
    if (waterTemp?.status === 'bad') {
      alerts.push({
        id: 'waterTemp',
        text: t('garden.sensor.alert.waterTempOut', { value: waterTemp.value.toFixed(1), crop: cropLabel }),
      })
    }
  } else {
    const soilMoisture = evalMetric(cropId, method, reading, 'soilMoisture')
    if (soilMoisture?.status === 'bad') {
      alerts.push({
        id: 'soilMoisture',
        text:
          soilMoisture.value < soilMoisture.range[0]
            ? t('garden.sensor.alert.soilDry')
            : t('garden.sensor.alert.soilWet'),
      })
    }

    const soilTemp = evalMetric(cropId, method, reading, 'soilTemp')
    if (soilTemp?.status === 'bad') {
      alerts.push({
        id: 'soilTemp',
        text: t('garden.sensor.alert.soilTempOut', { value: soilTemp.value.toFixed(1), crop: cropLabel }),
      })
    }
  }

  const airTemp = evalMetric(cropId, method, reading, 'airTemp')
  if (airTemp?.status === 'bad') {
    if (airTemp.value > airTemp.range[1]) {
      alerts.push({
        id: 'airTemp-high',
        text: t('garden.sensor.alert.heat', { value: Math.round(airTemp.value) }),
      })
    } else {
      alerts.push({
        id: 'airTemp-low',
        text: t('garden.sensor.alert.cold', { value: Math.round(airTemp.value), crop: cropLabel }),
      })
    }
  }

  return alerts
}
