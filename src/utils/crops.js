import cropsData from '../data/crops.json'
import { LOCALES } from '../i18n/locales'

export const CROPS = cropsData.crops

export function getCropById(cropId) {
  return CROPS.find((crop) => crop.id === cropId)
}

export function cropName(cropId, lang = 'en') {
  const dict = LOCALES[lang] ?? LOCALES.en
  return dict[`crops.${cropId}`] ?? LOCALES.en[`crops.${cropId}`] ?? getCropById(cropId)?.name ?? cropId
}
