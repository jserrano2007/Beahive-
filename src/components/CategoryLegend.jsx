import { getLegendItems } from '../utils/categories'
import { useI18n } from '../i18n/useI18n'
import './CategoryLegend.css'

function CategoryLegend() {
  const { lang } = useI18n()
  const legendItems = getLegendItems(lang)

  return (
    <div className="category-legend">
      {legendItems.map((item) => (
        <span key={item.label} className="legend-item">
          <span className="legend-dot" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default CategoryLegend
