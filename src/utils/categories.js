import { LOCALES } from '../i18n/locales'

export const CATEGORY_COLORS = {
  farmers_market: '#E4A93C',
  grocery: '#2F5D3A',
  small_grocery: '#6E8F4E',
  urban_farm: '#3F7F6B',
  community_garden: '#3F7F6B',
  food_pantry: '#6B5B95',
  home_grower: '#B8472F',
  business: '#5C6BC0',
}

const LEGEND_CATEGORY_KEYS = [
  'farmers_market',
  'grocery',
  'small_grocery',
  'urban_farm_combined',
  'food_pantry',
  'home_grower',
]

export function categoryLabel(category, lang = 'en') {
  const dict = LOCALES[lang] ?? LOCALES.en
  return dict[`categories.${category}`] ?? LOCALES.en[`categories.${category}`] ?? category
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? '#3b82f6'
}

export function getLegendItems(lang = 'en') {
  const dict = LOCALES[lang] ?? LOCALES.en
  return LEGEND_CATEGORY_KEYS.map((key) => {
    if (key === 'urban_farm_combined') {
      return {
        label: dict['legend.urbanFarmCombined'] ?? LOCALES.en['legend.urbanFarmCombined'],
        color: CATEGORY_COLORS.urban_farm,
      }
    }
    return { label: categoryLabel(key, lang), color: CATEGORY_COLORS[key] }
  })
}
