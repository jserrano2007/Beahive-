import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'

function SensorPairSheet({ open, method, onChangeMethod, onClose, onSubmit }) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div
      className={`detail-backdrop${open ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className={`detail-sheet${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('garden.sensor.pairTitle')}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="detail-close" onClick={onClose} aria-label={t('common.close')}>
          ×
        </button>

        <h2 className="detail-name">{t('garden.sensor.pairTitle')}</h2>
        <p>{t('garden.sensor.pairIntro')}</p>

        <form className="sensor-pair-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('garden.sensor.pairSourceLabel')}</span>
            <select value="demo" disabled>
              <option value="demo">{t('garden.sensor.demoLabel')}</option>
            </select>
          </label>

          <label className="field">
            <span>{t('garden.sensor.pairTypeLabel')}</span>
            <select value={method} onChange={(event) => onChangeMethod(event.target.value)}>
              <option value="hydro">{t('garden.sensor.method.hydro')}</option>
              <option value="soil">{t('garden.sensor.method.soil')}</option>
            </select>
          </label>

          <button type="submit" className="sell-submit">
            {t('garden.sensor.pairSubmit')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SensorPairSheet
