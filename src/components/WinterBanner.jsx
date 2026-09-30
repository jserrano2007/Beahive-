import { useState } from 'react'
import { categoryColor } from '../utils/categories'
import { useI18n } from '../i18n/useI18n'
import './WinterBanner.css'

const DISMISSED_KEY = 'freshmile_winter_banner_dismissed'

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed() {
  try {
    sessionStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

const SUGGESTIONS = [
  { key: 'grocery', labelKey: 'findFood.chip.grocery', color: categoryColor('grocery') },
  { key: 'freeFood', labelKey: 'findFood.chip.freeFood', color: categoryColor('food_pantry') },
  { key: 'neighbors', labelKey: 'findFood.viewNeighbors', color: categoryColor('home_grower') },
]

function WinterBanner({ onApplyFilter }) {
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(() => readDismissed())

  if (dismissed) return null

  function handleDismiss() {
    writeDismissed()
    setDismissed(true)
  }

  return (
    <div className="winter-banner">
      <button
        type="button"
        className="winter-banner-dismiss"
        onClick={handleDismiss}
        aria-label={t('common.close')}
      >
        ×
      </button>
      <p>{t('findFood.winterBannerText')}</p>
      <div className="winter-banner-actions">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.key}
            type="button"
            className="winter-banner-btn"
            style={{ background: suggestion.color }}
            onClick={() => onApplyFilter(suggestion.key)}
          >
            {t(suggestion.labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WinterBanner
