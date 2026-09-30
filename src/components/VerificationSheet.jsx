import { useEffect, useState } from 'react'
import { BUSINESS_TYPES, businessTypeLabel } from '../utils/account'
import { useI18n } from '../i18n/useI18n'
import './VerificationSheet.css'

const EMPTY_FORM = {
  businessName: '',
  businessType: BUSINESS_TYPES[0],
  linkedSourceId: '',
  registrationId: '',
  contactEmail: '',
}

function VerificationSheet({ open, sources = [], onClose, onSubmit }) {
  const { t, lang } = useI18n()
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      businessName: form.businessName.trim(),
      businessType: form.businessType,
      linkedSourceId: form.linkedSourceId || null,
      registrationId: form.registrationId.trim() || null,
      contactEmail: form.contactEmail.trim(),
    })
    setForm(EMPTY_FORM)
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
        aria-label={t('verify.heading')}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="detail-close" onClick={onClose} aria-label={t('common.close')}>
          ×
        </button>

        <h2 className="detail-name">{t('verify.heading')}</h2>

        <form className="verification-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('verify.businessName')}</span>
            <input
              type="text"
              value={form.businessName}
              onChange={(event) => updateField('businessName', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t('verify.type')}</span>
            <select
              value={form.businessType}
              onChange={(event) => updateField('businessType', event.target.value)}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {businessTypeLabel(type, lang)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('verify.linkExisting')}</span>
            <select
              value={form.linkedSourceId}
              onChange={(event) => updateField('linkedSourceId', event.target.value)}
            >
              <option value="">{t('common.none')}</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('verify.registrationId')}</span>
            <input
              type="text"
              value={form.registrationId}
              onChange={(event) => updateField('registrationId', event.target.value)}
            />
          </label>

          <label className="field">
            <span>{t('verify.contactEmail')}</span>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField('contactEmail', event.target.value)}
              required
            />
          </label>

          <button type="submit" className="sell-submit">
            {t('verify.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VerificationSheet
