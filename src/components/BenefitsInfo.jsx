import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import './BenefitsInfo.css'

const DISMISS_KEY = 'beahive.benefitsDismissed'

function BenefitsInfo() {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) !== '1'
    } catch {
      return true
    }
  })

  function toggle() {
    setExpanded((prev) => {
      const next = !prev
      try {
        if (next) window.localStorage.removeItem(DISMISS_KEY)
        else window.localStorage.setItem(DISMISS_KEY, '1')
      } catch {
        // Storage blocked (private mode etc.): toggle still works, just isn't remembered
      }
      return next
    })
  }

  return (
    <div className="benefits-info">
      <button
        type="button"
        className="benefits-toggle"
        aria-expanded={expanded}
        onClick={toggle}
      >
        {expanded ? '−' : '+'} {t('findFood.benefitsToggle')}
      </button>
      {expanded && (
        <div className="benefits-details">
          <p>
            <strong>{t('findFood.benefitsSnapTerm')}</strong> {t('findFood.benefitsSnapBody')}
          </p>
          <p>
            <strong>{t('findFood.benefitsWicTerm')}</strong> {t('findFood.benefitsWicBody')}
          </p>
          <p className="benefits-highlight">
            <strong>{t('findFood.benefitsSnapMatchTerm')}</strong>
            {t('findFood.benefitsSnapMatchBody')}
          </p>
        </div>
      )}
    </div>
  )
}

export default BenefitsInfo
