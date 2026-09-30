import { categoryColor } from './categories'

export const STORE_CHIPS = [
  { key: 'freeFood', labelKey: 'findFood.chip.freeFood', color: categoryColor('food_pantry') },
  { key: 'openNow', labelKey: 'findFood.chip.openNow' },
  { key: 'snap', labelKey: 'findFood.chip.snap' },
  { key: 'markets', labelKey: 'findFood.chip.markets', color: categoryColor('farmers_market') },
  { key: 'grocery', labelKey: 'findFood.chip.grocery', color: categoryColor('grocery') },
  { key: 'farms', labelKey: 'findFood.chip.farms', color: categoryColor('urban_farm') },
]

export const NEIGHBOR_CHIPS = [
  { key: 'snap', labelKey: 'findFood.chip.snap' },
  { key: 'readyNow', labelKey: 'findFood.chip.readyNow', color: categoryColor('home_grower') },
]
