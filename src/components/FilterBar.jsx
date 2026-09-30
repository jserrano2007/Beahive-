import { useI18n } from '../i18n/useI18n'
import './FilterBar.css'

function FilterBar({ filters = {}, chips = [], onToggle }) {
  const { t } = useI18n()
  return (
    <div className="filter-bar">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className={`filter-chip${filters[chip.key] ? ' active' : ''}`}
          aria-pressed={filters[chip.key]}
          onClick={() => onToggle(chip.key)}
          style={
            filters[chip.key] && chip.color
              ? { background: chip.color, borderColor: chip.color }
              : undefined
          }
        >
          {t(chip.labelKey)}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
