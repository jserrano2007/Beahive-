import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { formatShortDate, toDateStr } from '../utils/dates'
import { getNow } from '../utils/hours'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import './MyBusinessPanel.css'

const THEME_SUGGESTIONS = [
  'SNAP double day',
  'Kids activities',
  'Chef demo',
  'Live music',
  'Fall harvest festival',
  'Bring reusable bags',
]

const emptyDraft = (todayStr) => ({
  id: null,
  date: todayStr,
  address: '',
  neighborhood: '',
  startTime: '10:00',
  endTime: '14:00',
  theme: '',
  notes: '',
})

function sortByDate(a, b) {
  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
}

function MyBusinessPanel({
  account = {},
  stops = [],
  onSaveStop,
  onRemoveStop,
}) {
  const { t, lang } = useI18n()
  const now = useMemo(() => getNow(), [])
  const todayStr = toDateStr(now)
  const [draft, setDraft] = useState(() => emptyDraft(todayStr))
  const [editingId, setEditingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const upcoming = useMemo(
    () => stops.filter((s) => s.date >= todayStr).sort(sortByDate),
    [stops, todayStr],
  )
  const past = useMemo(
    () => stops.filter((s) => s.date < todayStr).sort((a, b) => sortByDate(b, a)),
    [stops, todayStr],
  )

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  function handleEdit(stop) {
    setEditingId(stop.id)
    setDraft({
      id: stop.id,
      date: stop.date || todayStr,
      address: stop.address || '',
      neighborhood: stop.neighborhood || '',
      startTime: stop.startTime || '10:00',
      endTime: stop.endTime || '14:00',
      theme: stop.theme || '',
      notes: stop.notes || '',
    })
  }

  function handleCancel() {
    setDraft(emptyDraft(todayStr))
    setEditingId(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!draft.address.trim() || !draft.date) return
    onSaveStop({
      ...draft,
      address: draft.address.trim(),
      neighborhood: draft.neighborhood || null,
      theme: draft.theme.trim(),
      notes: draft.notes.trim(),
    })
    handleCancel()
  }

  function renderStopCard(stop) {
    const isConfirming = confirmDeleteId === stop.id
    return (
      <li key={stop.id} className="mb-stop-card">
        <div className="mb-stop-header">
          <span className="mb-stop-date">{formatShortDate(stop.date, lang)}</span>
          <span className="mb-stop-time">
            {stop.startTime}–{stop.endTime}
          </span>
        </div>
        <div className="mb-stop-address">{stop.address}</div>
        {stop.neighborhood && (
          <div className="mb-stop-hood">{stop.neighborhood}</div>
        )}
        {stop.theme && <div className="mb-stop-theme">{stop.theme}</div>}
        {stop.notes && <div className="mb-stop-notes">{stop.notes}</div>}
        <div className="mb-stop-actions">
          <button type="button" className="mb-stop-edit" onClick={() => handleEdit(stop)}>
            {t('common.edit')}
          </button>
          {isConfirming ? (
            <div className="mb-stop-confirm">
              <span>{t('business.confirmRemove')}</span>
              <button
                type="button"
                className="mb-stop-confirm-yes"
                onClick={() => {
                  onRemoveStop(stop.id)
                  setConfirmDeleteId(null)
                  if (editingId === stop.id) handleCancel()
                }}
              >
                {t('common.yes')}
              </button>
              <button
                type="button"
                className="mb-stop-confirm-no"
                onClick={() => setConfirmDeleteId(null)}
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mb-stop-remove"
              onClick={() => setConfirmDeleteId(stop.id)}
            >
              {t('common.remove')}
            </button>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="my-business-panel">
      <header className="mb-header">
        <h2>{t('business.heading')}</h2>
        <p className="mb-sub">
          {account.businessName
            ? t('business.subForNamed', { name: account.businessName })
            : t('business.sub')}
        </p>
      </header>

      <form className="mb-form" onSubmit={handleSubmit}>
        <h3 className="mb-form-heading">
          {editingId ? t('business.editStop') : t('business.addStop')}
        </h3>

        <label className="field">
          <span>{t('business.field.date')}</span>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => updateDraft('date', e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>{t('business.field.address')}</span>
          <input
            type="text"
            value={draft.address}
            placeholder={t('business.field.addressPlaceholder')}
            onChange={(e) => updateDraft('address', e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>{t('business.field.neighborhood')}</span>
          <select
            value={draft.neighborhood}
            onChange={(e) => updateDraft('neighborhood', e.target.value)}
          >
            <option value="">{t('common.notSet')}</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n.key} value={n.label}>
                {n.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-time-row">
          <label className="field">
            <span>{t('business.field.startTime')}</span>
            <input
              type="time"
              value={draft.startTime}
              onChange={(e) => updateDraft('startTime', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>{t('business.field.endTime')}</span>
            <input
              type="time"
              value={draft.endTime}
              onChange={(e) => updateDraft('endTime', e.target.value)}
              required
            />
          </label>
        </div>

        <label className="field">
          <span>{t('business.field.theme')}</span>
          <input
            type="text"
            value={draft.theme}
            list="mb-theme-suggestions"
            placeholder={t('business.field.themePlaceholder')}
            onChange={(e) => updateDraft('theme', e.target.value)}
          />
          <datalist id="mb-theme-suggestions">
            {THEME_SUGGESTIONS.map((theme) => (
              <option key={theme} value={theme} />
            ))}
          </datalist>
        </label>

        <label className="field">
          <span>{t('business.field.notes')}</span>
          <textarea
            rows={2}
            value={draft.notes}
            placeholder={t('business.field.notesPlaceholder')}
            onChange={(e) => updateDraft('notes', e.target.value)}
          />
        </label>

        <div className="mb-form-actions">
          <button type="submit" className="mb-form-submit">
            {editingId ? t('common.save') : t('business.saveStop')}
          </button>
          {editingId && (
            <button
              type="button"
              className="mb-form-cancel"
              onClick={handleCancel}
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>

      <section className="mb-section">
        <h3>{t('business.upcomingHeading')}</h3>
        {upcoming.length === 0 ? (
          <p className="mb-empty">{t('business.upcomingEmpty')}</p>
        ) : (
          <ul className="mb-stop-list">{upcoming.map(renderStopCard)}</ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mb-section">
          <h3>{t('business.pastHeading')}</h3>
          <ul className="mb-stop-list">{past.slice(0, 6).map(renderStopCard)}</ul>
        </section>
      )}
    </div>
  )
}

export default MyBusinessPanel
