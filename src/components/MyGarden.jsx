import { useEffect, useState } from 'react'
import {
  CHECK_IN_TYPES,
  CROPS,
  GROWING_METHODS,
  OUTDOOR_METHODS,
  checkInIcon,
  getGrowthProgress,
  growingMethodLabel,
  isOutdoorPlanting,
  plantingNeighborhoodKey,
  trackingLevel,
} from '../utils/plantings'
import { cropName } from '../utils/crops'
import { formatShortDate, toDateStr } from '../utils/dates'
import { resizeImageToDataUrl } from '../utils/image'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { PLUS_LISTING_LIMIT, canCreateListing, countActiveListings } from '../utils/account'
import { useI18n } from '../i18n/useI18n'
import SensorPanel from './SensorPanel'
import WeatherStrip from './WeatherStrip'
import HarvestForm from './HarvestForm'
import GrowReport from './GrowReport'
import { getGrowReport } from '../data/store'
import './MyGarden.css'

function MyGarden({
  plantings = [],
  listings = [],
  account = {},
  learnMode = false,
  devices = [],
  prefillCropId,
  now,
  onAddPlanting,
  onRemovePlanting,
  onAddNote,
  onListForSale,
  onConsumePrefill,
  onUpdateAccount,
  onGoToGrow,
  onGoToSell,
  onPairDevice,
  onDisconnectDevice,
  sharedReports = [],
  onRecordHarvest,
  onFinishPlanting,
  onShareReport,
  onUnshareReport,
  onAskCommunity,
}) {
  const { t, lang } = useI18n()
  const todayStr = toDateStr(now)

  const defaultNeighborhoodKey = plantingNeighborhoodKey({}, account)
  const [form, setForm] = useState(() => ({
    cropId: prefillCropId || CROPS[0]?.id || '',
    datePlanted: todayStr,
    method: GROWING_METHODS[0],
    neighborhoodKey: defaultNeighborhoodKey,
  }))
  const [noteDrafts, setNoteDrafts] = useState({})
  const [photoDrafts, setPhotoDrafts] = useState({})
  const [logErrors, setLogErrors] = useState({})
  const [confirmingRemoveId, setConfirmingRemoveId] = useState(null)
  const [limitBlocked, setLimitBlocked] = useState(false)
  const [harvestFormId, setHarvestFormId] = useState(null)
  const [openReports, setOpenReports] = useState({})
  const [confirmingFinishId, setConfirmingFinishId] = useState(null)

  function toggleReport(plantingId) {
    setOpenReports((prev) => ({ ...prev, [plantingId]: !prev[plantingId] }))
  }

  function renderReport(planting) {
    const report = getGrowReport(planting.id)
    if (!report) return null
    return (
      <GrowReport
        report={report}
        account={account}
        sharedRow={sharedReports.find((row) => row.plantingId === planting.id) ?? null}
        onShare={onShareReport}
        onUnshare={onUnshareReport}
        onAskCommunity={onAskCommunity}
      />
    )
  }

  function renderHarvests(planting) {
    if (planting.harvests.length === 0) return null
    return (
      <ul className="harvest-list">
        {planting.harvests.map((harvest) => (
          <li key={harvest.id}>
            <span aria-hidden="true">🧺</span>
            <div className="garden-log-body">
              <span>
                {formatShortDate(harvest.date, lang)} ·{' '}
                <strong>
                  {harvest.amount} {t(`garden.harvest.unit.${harvest.unit}`)}
                </strong>{' '}
                · {t('garden.harvest.qualityShort', { quality: harvest.quality })}
                {harvest.changeNextTime && ` · ${harvest.changeNextTime}`}
              </span>
              {harvest.photo && (
                <img className="garden-log-photo" src={harvest.photo} alt={t('garden.harvest.photoAlt')} />
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  useEffect(() => {
    if (prefillCropId) onConsumePrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onAddPlanting({
      id: `planting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cropId: form.cropId,
      datePlanted: form.datePlanted,
      method: form.method,
      neighborhoodKey: form.neighborhoodKey,
      notes: [],
    })
    setForm({
      cropId: CROPS[0]?.id || '',
      datePlanted: todayStr,
      method: GROWING_METHODS[0],
      neighborhoodKey: defaultNeighborhoodKey,
    })
  }

  // Check-ins and notes share the planting's log. A pending note or photo
  // rides along with whichever check-in button is tapped.
  function handleLog(plantingId, type) {
    const text = (noteDrafts[plantingId] || '').trim()
    const photo = photoDrafts[plantingId] || null
    if (type === 'note' && !text && !photo) return
    const saved = onAddNote(plantingId, {
      date: todayStr,
      type,
      text,
      photo,
    })
    if (saved === false) {
      setLogErrors((prev) => ({ ...prev, [plantingId]: t('garden.checkin.saveError') }))
      return
    }
    setLogErrors((prev) => ({ ...prev, [plantingId]: null }))
    setNoteDrafts((prev) => ({ ...prev, [plantingId]: '' }))
    setPhotoDrafts((prev) => ({ ...prev, [plantingId]: null }))
  }

  async function handlePhotoChange(plantingId, event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setLogErrors((prev) => ({ ...prev, [plantingId]: null }))
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setPhotoDrafts((prev) => ({ ...prev, [plantingId]: dataUrl }))
    } catch {
      setLogErrors((prev) => ({ ...prev, [plantingId]: t('sell.photoError') }))
    }
  }

  function handleListForSaleClick(planting) {
    if (!canCreateListing(account, listings)) {
      setLimitBlocked(true)
      return
    }
    onListForSale({
      mode: 'create',
      plantingId: planting.id,
      cropId: planting.cropId,
      datePlanted: planting.datePlanted,
    })
  }

  function handleUpgrade() {
    onUpdateAccount({ subscription: 'plus' })
    setLimitBlocked(false)
  }

  const archived = plantings
    .filter((planting) => planting.status === 'finished')
    .sort((a, b) => ((a.finishedAt ?? '') < (b.finishedAt ?? '') ? 1 : -1))
  const sorted = plantings.filter((planting) => planting.status !== 'finished').sort((a, b) => {
    const progressA = getGrowthProgress(a, now)
    const progressB = getGrowthProgress(b, now)
    const remainingA = progressA ? progressA.daysRemaining : Infinity
    const remainingB = progressB ? progressB.daysRemaining : Infinity
    return remainingA - remainingB
  })

  return (
    <div className="my-garden">
      <form className="garden-form" onSubmit={handleSubmit}>
        <h2>{t('garden.heading')}</h2>

        <label className="field">
          <span>{t('sell.field.crop')}</span>
          <select
            value={form.cropId}
            onChange={(event) => updateField('cropId', event.target.value)}
            required
          >
            {CROPS.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {cropName(crop.id, lang)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('garden.datePlanted')}</span>
          <input
            type="date"
            value={form.datePlanted}
            max={todayStr}
            onChange={(event) => updateField('datePlanted', event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>{t('garden.growingMethod')}</span>
          <select
            value={form.method}
            onChange={(event) => updateField('method', event.target.value)}
          >
            {GROWING_METHODS.map((method) => (
              <option key={method} value={method}>
                {growingMethodLabel(method, lang)}
              </option>
            ))}
          </select>
        </label>

        {OUTDOOR_METHODS.includes(form.method) && (
          <label className="field">
            <span>{t('garden.neighborhood')}</span>
            <select
              value={form.neighborhoodKey}
              onChange={(event) => updateField('neighborhoodKey', event.target.value)}
            >
              {NEIGHBORHOODS.map((neighborhood) => (
                <option key={neighborhood.key} value={neighborhood.key}>
                  {neighborhood.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" className="garden-submit">
          {t('garden.startTracking')}
        </button>
      </form>

      {limitBlocked && (
        <div className="garden-limit-card">
          <p>
            {t('garden.limitText', {
              count: countActiveListings(listings),
              limit: PLUS_LISTING_LIMIT,
            })}
          </p>
          <div className="garden-limit-actions">
            <button type="button" className="garden-limit-upgrade" onClick={handleUpgrade}>
              {t('garden.upgrade')}
            </button>
            <button
              type="button"
              className="garden-limit-view"
              onClick={() => {
                setLimitBlocked(false)
                onGoToSell()
              }}
            >
              {t('garden.viewListings')}
            </button>
          </div>
          <button
            type="button"
            className="garden-limit-dismiss"
            onClick={() => setLimitBlocked(false)}
          >
            {t('garden.dismiss')}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="garden-empty">
          <p>{t('garden.emptyTitle')}</p>
          <p>{t('garden.emptyBody')}</p>
          <button type="button" className="garden-empty-btn" onClick={onGoToGrow}>
            {t('garden.browseGuides')}
          </button>
        </div>
      ) : (
        <ul className="garden-list">
          {sorted.map((planting) => {
            const progress = getGrowthProgress(planting, now, lang)
            if (!progress) return null
            const isConfirming = confirmingRemoveId === planting.id
            const existingListing = listings.find((listing) => listing.plantingId === planting.id)
            const device = devices.find((d) => d.plantingId === planting.id) ?? null
            const level = trackingLevel(planting, device)
            const photoDraft = photoDrafts[planting.id]
            const logError = logErrors[planting.id]

            return (
              <li key={planting.id} className="garden-card">
                <div className="garden-card-header">
                  <span className="place-name">{progress.cropName}</span>
                  <span className="garden-method">{growingMethodLabel(planting.method, lang)}</span>
                </div>
                <span className={`status-chip garden-tracking-level ${device ? 'open' : 'closed'}`}>
                  {t(`garden.trackingLevel.${level}`)}
                </span>

                <div
                  className="garden-progress-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={progress.totalDays}
                  aria-valuenow={progress.dayIndex}
                  aria-label={t('garden.dayCount', {
                    day: progress.dayIndex,
                    total: progress.totalDays,
                  })}
                >
                  <div
                    className="garden-progress-fill"
                    style={{ width: `${progress.fraction * 100}%` }}
                  />
                </div>

                <div className="garden-day-count">
                  {t('garden.dayCount', { day: progress.dayIndex, total: progress.totalDays })}
                </div>
                <div className={`place-status${progress.isReady ? ' open' : ''}`}>
                  {progress.isReady
                    ? t('garden.readyNow')
                    : t('garden.harvestIn', {
                        days: progress.daysRemaining,
                        date: formatShortDate(progress.harvestDateStr, lang),
                      })}
                </div>

                {renderHarvests(planting)}
                {harvestFormId === planting.id && (
                  <HarvestForm
                    todayStr={todayStr}
                    minDate={planting.datePlanted}
                    onCancel={() => setHarvestFormId(null)}
                    onSubmit={(harvest) => {
                      const saved = onRecordHarvest(planting.id, harvest)
                      if (saved !== false) setHarvestFormId(null)
                      return saved
                    }}
                  />
                )}

                {isOutdoorPlanting(planting) && (
                  <WeatherStrip
                    plantingId={planting.id}
                    plantingMethod={planting.method}
                    neighborhoodKey={plantingNeighborhoodKey(planting, account)}
                  />
                )}

                <SensorPanel
                  plantingId={planting.id}
                  plantingMethod={planting.method}
                  cropId={planting.cropId}
                  cropLabel={progress.cropName}
                  device={device}
                  learnMode={learnMode}
                  onPairDevice={onPairDevice}
                  onDisconnectDevice={onDisconnectDevice}
                />

                <div className="garden-notes">
                  <div className="garden-checkins" role="group" aria-label={t('garden.checkin.heading')}>
                    {CHECK_IN_TYPES.map(({ type, icon }) => (
                      <button
                        key={type}
                        type="button"
                        className="garden-checkin-btn"
                        onClick={() => handleLog(planting.id, type)}
                      >
                        <span aria-hidden="true">{icon}</span> {t(`garden.checkin.${type}`)}
                      </button>
                    ))}
                  </div>

                  {planting.notes.length > 0 && (
                    <ul className="garden-notes-list">
                      {planting.notes.map((note) => (
                        <li key={note.id} className="garden-log-entry">
                          <span className="garden-log-icon" aria-hidden="true">
                            {checkInIcon(note.type)}
                          </span>
                          <div className="garden-log-body">
                            <span>
                              {formatShortDate(note.date, lang)}
                              {note.type && note.type !== 'note' && (
                                <strong> · {t(`garden.checkin.${note.type}`)}</strong>
                              )}
                              {note.text && ` · ${note.text}`}
                            </span>
                            {note.photo && (
                              <img
                                className="garden-log-photo"
                                src={note.photo}
                                alt={t('garden.checkin.photoAlt')}
                              />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {photoDraft && (
                    <div className="garden-photo-draft">
                      <img src={photoDraft} alt={t('garden.checkin.photoAlt')} />
                      <button
                        type="button"
                        className="garden-confirm-no"
                        onClick={() => setPhotoDrafts((prev) => ({ ...prev, [planting.id]: null }))}
                      >
                        {t('sell.field.removePhoto')}
                      </button>
                    </div>
                  )}
                  {logError && <p className="garden-log-error">{logError}</p>}


                  {learnMode && (
                    <div className="garden-learn-prompt">
                      <span className="garden-learn-badge" aria-hidden="true">💡</span>
                      <span>{t('learn.gardenPredictPrompt')}</span>
                    </div>
                  )}

                  <div className="garden-notes-input">
                    <label className="garden-photo-btn" title={t('garden.checkin.addPhoto')}>
                      <span aria-hidden="true">📷</span>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label={t('garden.checkin.addPhoto')}
                        onChange={(event) => handlePhotoChange(planting.id, event)}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder={t('garden.notePlaceholder')}
                      value={noteDrafts[planting.id] || ''}
                      onChange={(event) =>
                        setNoteDrafts((prev) => ({ ...prev, [planting.id]: event.target.value }))
                      }
                    />
                    <button type="button" onClick={() => handleLog(planting.id, 'note')}>
                      {t('garden.logNote')}
                    </button>
                  </div>
                </div>

                {openReports[planting.id] && renderReport(planting)}

                <div className="garden-actions">
                  {harvestFormId !== planting.id && (
                    <button
                      type="button"
                      className="garden-limit-upgrade"
                      onClick={() => setHarvestFormId(planting.id)}
                    >
                      {t('garden.harvest.record')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="garden-sell-btn"
                    aria-expanded={Boolean(openReports[planting.id])}
                    onClick={() => toggleReport(planting.id)}
                  >
                    {openReports[planting.id] ? t('garden.report.hide') : t('garden.report.view')}
                  </button>
                  {existingListing ? (
                    <button
                      type="button"
                      className="garden-sell-btn"
                      onClick={() => onListForSale({ mode: 'edit', listing: existingListing })}
                    >
                      {t('garden.editListing')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="garden-sell-btn"
                      onClick={() => handleListForSaleClick(planting)}
                    >
                      {t('garden.listForSale')}
                    </button>
                  )}

                  {confirmingFinishId === planting.id ? (
                    <div className="garden-confirm-remove">
                      <span>{t('garden.finish.confirm')}</span>
                      <button
                        type="button"
                        className="garden-limit-upgrade"
                        onClick={() => {
                          onFinishPlanting(planting.id)
                          setConfirmingFinishId(null)
                          setHarvestFormId(null)
                          setOpenReports((prev) => ({ ...prev, [planting.id]: true }))
                        }}
                      >
                        {t('garden.finish.confirmYes')}
                      </button>
                      <button
                        type="button"
                        className="garden-confirm-no"
                        onClick={() => setConfirmingFinishId(null)}
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="garden-sell-btn"
                      onClick={() => setConfirmingFinishId(planting.id)}
                    >
                      {t('garden.finish.button')}
                    </button>
                  )}

                  {isConfirming ? (
                    <div className="garden-confirm-remove">
                      <span>{t('garden.confirmRemove')}</span>
                      <button
                        type="button"
                        className="garden-confirm-yes"
                        onClick={() => {
                          onRemovePlanting(planting.id)
                          setConfirmingRemoveId(null)
                        }}
                      >
                        {t('garden.confirmYes')}
                      </button>
                      <button
                        type="button"
                        className="garden-confirm-no"
                        onClick={() => setConfirmingRemoveId(null)}
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="garden-remove-btn"
                      onClick={() => setConfirmingRemoveId(planting.id)}
                    >
                      {t('common.remove')}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {archived.length > 0 && (
        <section className="garden-archive">
          <h2>{t('garden.archive.heading')}</h2>
          <ul className="garden-list">
            {archived.map((planting) => {
              const isConfirming = confirmingRemoveId === planting.id
              return (
                <li key={planting.id} className="garden-card">
                  <div className="garden-card-header">
                    <span className="place-name">{cropName(planting.cropId, lang)}</span>
                    <span className="garden-method">{growingMethodLabel(planting.method, lang)}</span>
                  </div>
                  <div className="garden-day-count">
                    {t('garden.archive.finishedOn', {
                      date: formatShortDate(planting.finishedAt, lang),
                    })}
                  </div>

                  {renderHarvests(planting)}
                  {openReports[planting.id] && renderReport(planting)}

                  <div className="garden-actions">
                    <button
                      type="button"
                      className="garden-sell-btn"
                      aria-expanded={Boolean(openReports[planting.id])}
                      onClick={() => toggleReport(planting.id)}
                    >
                      {openReports[planting.id] ? t('garden.report.hide') : t('garden.report.view')}
                    </button>
                    {isConfirming ? (
                      <div className="garden-confirm-remove">
                        <span>{t('garden.archive.confirmRemove')}</span>
                        <button
                          type="button"
                          className="garden-confirm-yes"
                          onClick={() => {
                            onRemovePlanting(planting.id)
                            setConfirmingRemoveId(null)
                          }}
                        >
                          {t('garden.confirmYes')}
                        </button>
                        <button
                          type="button"
                          className="garden-confirm-no"
                          onClick={() => setConfirmingRemoveId(null)}
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="garden-remove-btn"
                        onClick={() => setConfirmingRemoveId(planting.id)}
                      >
                        {t('common.remove')}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

export default MyGarden
