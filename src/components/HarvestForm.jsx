import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { HARVEST_UNITS } from '../utils/growReport'
import { resizeImageToDataUrl } from '../utils/image'
import './GrowReport.css'

const QUALITY_LEVELS = [1, 2, 3, 4, 5]

function HarvestForm({ todayStr, minDate, onSubmit, onCancel }) {
  const { t } = useI18n()
  const [form, setForm] = useState({
    date: todayStr,
    amount: '',
    unit: HARVEST_UNITS[0],
    quality: 4,
    photo: null,
    changeNextTime: '',
  })
  const [error, setError] = useState(null)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    try {
      updateField('photo', await resizeImageToDataUrl(file))
    } catch {
      setError(t('sell.photoError'))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!(amount > 0)) return
    const saved = onSubmit({
      date: form.date,
      amount,
      unit: form.unit,
      quality: form.quality,
      photo: form.photo,
      changeNextTime: form.changeNextTime.trim(),
    })
    if (saved === false) setError(t('garden.checkin.saveError'))
  }

  return (
    <form className="harvest-form" onSubmit={handleSubmit}>
      <h3>{t('garden.harvest.formTitle')}</h3>

      <div className="harvest-form-row">
        <label className="field">
          <span>{t('garden.harvest.amount')}</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>{t('garden.harvest.unit')}</span>
          <select value={form.unit} onChange={(event) => updateField('unit', event.target.value)}>
            {HARVEST_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`garden.harvest.unit.${unit}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>{t('garden.harvest.date')}</span>
        <input
          type="date"
          value={form.date}
          min={minDate}
          max={todayStr}
          onChange={(event) => updateField('date', event.target.value)}
          required
        />
      </label>

      <fieldset className="harvest-quality">
        <legend>{t('garden.harvest.quality')}</legend>
        <div className="harvest-quality-options">
          {QUALITY_LEVELS.map((level) => (
            <label key={level} className={`harvest-quality-option${form.quality === level ? ' selected' : ''}`}>
              <input
                type="radio"
                name="quality"
                value={level}
                checked={form.quality === level}
                onChange={() => updateField('quality', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <span className="text-note">{t('garden.harvest.qualityHint')}</span>
      </fieldset>

      <label className="field">
        <span>{t('sell.field.photo')}</span>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </label>
      {form.photo && (
        <div className="garden-photo-draft">
          <img src={form.photo} alt={t('garden.checkin.photoAlt')} />
          <button type="button" className="garden-confirm-no" onClick={() => updateField('photo', null)}>
            {t('sell.field.removePhoto')}
          </button>
        </div>
      )}

      <label className="field">
        <span>{t('garden.harvest.changeNextTime')}</span>
        <textarea
          rows={2}
          value={form.changeNextTime}
          placeholder={t('garden.harvest.changeNextTimePlaceholder')}
          onChange={(event) => updateField('changeNextTime', event.target.value)}
        />
      </label>

      {error && <p className="garden-log-error">{error}</p>}

      <div className="garden-actions">
        <button type="submit" className="garden-limit-upgrade">
          {t('garden.harvest.save')}
        </button>
        <button type="button" className="garden-confirm-no" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

export default HarvestForm
