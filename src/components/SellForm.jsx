import { useEffect, useState } from 'react'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { CROPS, cropName } from '../utils/crops'
import { formatListingPrice, getReadyStatus } from '../utils/listings'
import { formatShortDate, toDateStr } from '../utils/dates'
import { resizeImageToDataUrl } from '../utils/image'
import { canCreateListing, countActiveListings, getListingLimit } from '../utils/account'
import { useI18n } from '../i18n/useI18n'
import './SellForm.css'

const UNITS = [
  { value: 'pint', labelKey: 'units.pint' },
  { value: 'lb', labelKey: 'units.lb' },
  { value: 'bunch', labelKey: 'units.bunch' },
  { value: 'head', labelKey: 'units.head' },
  { value: 'each', labelKey: 'units.each' },
  { value: 'free', labelKey: 'units.free' },
]

const EMPTY_NEIGHBOR_FORM = {
  mode: 'none',
  sellerType: 'neighbor',
  listingId: null,
  plantingId: null,
  cropId: null,
  datePlanted: null,
  neighborhoodKey: NEIGHBORHOODS[0]?.key ?? '',
  displayName: '',
  price: '',
  unit: 'lb',
  snap: false,
  photo: null,
}

function emptyBusinessForm(account) {
  return {
    mode: 'create',
    sellerType: 'business',
    listingId: null,
    cropId: CROPS[0]?.id ?? null,
    cropName: '',
    price: '',
    unit: 'lb',
    snap: false,
    photo: null,
    availableUntil: '',
    neighborhoodKey: account?.neighborhood || NEIGHBORHOODS[0]?.key || '',
  }
}

function buildInitialForm(prefill, account) {
  if (prefill?.mode === 'edit') {
    const { listing } = prefill
    if (listing.sellerType === 'business') {
      return {
        mode: 'edit',
        sellerType: 'business',
        listingId: listing.id,
        cropId: listing.cropId,
        cropName: listing.cropId ? '' : (listing.cropName ?? ''),
        price: listing.unit === 'free' ? '' : String(listing.price),
        unit: listing.unit,
        snap: listing.snap,
        photo: listing.photo,
        availableUntil: listing.availableUntil ?? '',
        neighborhoodKey: listing.neighborhoodKey || NEIGHBORHOODS[0]?.key || '',
      }
    }
    return {
      mode: 'edit',
      sellerType: 'neighbor',
      listingId: listing.id,
      plantingId: listing.plantingId,
      cropId: listing.cropId,
      datePlanted: listing.datePlanted,
      neighborhoodKey: listing.neighborhoodKey,
      displayName: listing.displayName,
      price: listing.unit === 'free' ? '' : String(listing.price),
      unit: listing.unit,
      snap: listing.snap,
      photo: listing.photo,
    }
  }

  if (prefill?.mode === 'create') {
    return {
      ...EMPTY_NEIGHBOR_FORM,
      mode: 'create',
      sellerType: 'neighbor',
      plantingId: prefill.plantingId,
      cropId: prefill.cropId,
      datePlanted: prefill.datePlanted,
      neighborhoodKey: account.neighborhood || NEIGHBORHOODS[0]?.key || '',
      displayName: account.displayName || '',
    }
  }

  if (account.type === 'business') {
    return emptyBusinessForm(account)
  }

  return EMPTY_NEIGHBOR_FORM
}

function SellForm({
  listings = [],
  now,
  prefill,
  account = {},
  sources = [],
  onSaveListing,
  onUpdateListing,
  onRemoveListing,
  onListForSale,
  onConsumePrefill,
  onUpdateAccount,
  onGoToGarden,
  onViewInFindFood,
  onOpenSettings,
  onViewOnMap,
}) {
  const { t, tCount, lang } = useI18n()
  const [form, setForm] = useState(() => buildInitialForm(prefill, account))
  const [submitted, setSubmitted] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const [limitError, setLimitError] = useState(false)

  useEffect(() => {
    if (prefill) onConsumePrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError(null)
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      updateField('photo', dataUrl)
    } catch {
      setPhotoError(t('sell.photoError'))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (
      form.mode === 'create' &&
      form.sellerType === 'neighbor' &&
      !canCreateListing(account, listings)
    ) {
      setLimitError(true)
      return
    }
    setLimitError(false)

    if (form.sellerType === 'business') {
      const payload = {
        sellerType: 'business',
        cropId: form.cropId,
        cropName: form.cropId ? null : form.cropName.trim(),
        price: form.unit === 'free' ? 0 : Number(form.price),
        unit: form.unit,
        snap: form.snap,
        photo: form.photo,
        availableUntil: form.availableUntil,
        displayName: account.businessName || 'Business',
        linkedSourceId: account.linkedSourceId || null,
        neighborhoodKey: account.linkedSourceId ? null : form.neighborhoodKey,
        plantingId: null,
        datePlanted: null,
      }
      if (form.mode === 'edit') {
        onUpdateListing(form.listingId, payload)
      } else {
        onSaveListing({
          id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          demo: false,
          sellerRating: null,
          sellerReviewCount: null,
          ...payload,
        })
      }
    } else {
      const payload = {
        sellerType: 'neighbor',
        neighborhoodKey: form.neighborhoodKey,
        displayName: form.displayName.trim(),
        price: form.unit === 'free' ? 0 : Number(form.price),
        unit: form.unit,
        snap: form.snap,
        photo: form.photo,
      }
      if (form.mode === 'edit') {
        onUpdateListing(form.listingId, payload)
      } else {
        onSaveListing({
          id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          plantingId: form.plantingId,
          cropId: form.cropId,
          datePlanted: form.datePlanted,
          demo: false,
          sellerRating: null,
          sellerReviewCount: null,
          ...payload,
        })
        onUpdateAccount({ displayName: payload.displayName, neighborhood: payload.neighborhoodKey })
      }
    }

    setSubmitted(true)
  }

  function handlePostAnother() {
    setForm(emptyBusinessForm(account))
    setSubmitted(false)
  }

  const myListings = listings.filter((listing) => !listing.demo)
  const activeCount = countActiveListings(listings)
  const listingLimit = getListingLimit(account)
  const usageText =
    listingLimit === Infinity
      ? tCount('sell.usage_unlimited', activeCount)
      : t('sell.usage_limited', { count: activeCount, limit: listingLimit })

  function handleEditListing(listing) {
    onListForSale({ mode: 'edit', listing })
  }

  const showBusinessForm = form.sellerType === 'business'
  const showNeighborForm = form.sellerType === 'neighbor' && form.mode !== 'none'

  return (
    <div className="sell-tab">
      <button type="button" className="sell-account-summary" onClick={onOpenSettings}>
        {t('sell.accountSummary', { usage: usageText })}
      </button>

      {showBusinessForm && !submitted && (
        <form className="sell-form" onSubmit={handleSubmit}>
          <h2>{form.mode === 'edit' ? t('sell.editListing') : t('sell.postListing')}</h2>

          <label className="field">
            <span>{t('sell.field.crop')}</span>
            <select
              value={form.cropId ?? 'other'}
              onChange={(event) => {
                const value = event.target.value
                if (value === 'other') {
                  updateField('cropId', null)
                } else {
                  setForm((prev) => ({ ...prev, cropId: value }))
                }
              }}
            >
              {CROPS.map((cropOption) => (
                <option key={cropOption.id} value={cropOption.id}>
                  {cropName(cropOption.id, lang)}
                </option>
              ))}
              <option value="other">{t('sell.field.other')}</option>
            </select>
          </label>

          {form.cropId === null && (
            <label className="field">
              <span>{t('sell.field.cropName')}</span>
              <input
                type="text"
                value={form.cropName}
                onChange={(event) => updateField('cropName', event.target.value)}
                placeholder={t('sell.field.cropNamePlaceholder')}
                required
              />
            </label>
          )}

          <label className="field">
            <span>{t('sell.field.unit')}</span>
            <select value={form.unit} onChange={(event) => updateField('unit', event.target.value)}>
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {t(unit.labelKey)}
                </option>
              ))}
            </select>
          </label>

          {form.unit !== 'free' && (
            <label className="field">
              <span>{t('sell.field.price')}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                required
              />
            </label>
          )}

          <label className="field">
            <span>{t('sell.field.availableUntil')}</span>
            <input
              type="date"
              value={form.availableUntil}
              min={toDateStr(now)}
              onChange={(event) => updateField('availableUntil', event.target.value)}
              required
            />
          </label>

          {!account.linkedSourceId && (
            <label className="field">
              <span>{t('sell.field.neighborhoodPin')}</span>
              <select
                value={form.neighborhoodKey}
                onChange={(event) => updateField('neighborhoodKey', event.target.value)}
                required
              >
                {NEIGHBORHOODS.map((neighborhood) => (
                  <option key={neighborhood.key} value={neighborhood.key}>
                    {neighborhood.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span>{t('sell.field.photo')}</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          {photoError && <p className="sell-photo-error">{photoError}</p>}
          {form.photo && (
            <div className="sell-photo-preview">
              <img src={form.photo} alt={t("sell.field.photoPreviewAlt")} />
              <button type="button" onClick={() => updateField('photo', null)}>
                {t('sell.field.removePhoto')}
              </button>
            </div>
          )}

          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={form.snap}
              onChange={(event) => updateField('snap', event.target.checked)}
            />
            <span>{t('sell.field.snap')}</span>
          </label>

          <button type="submit" className="sell-submit">
            {form.mode === 'edit' ? t('sell.saveChanges') : t('sell.postSubmit')}
          </button>
        </form>
      )}

      {showNeighborForm && !submitted && (
        <form className="sell-form" onSubmit={handleSubmit}>
          <h2>{form.mode === 'edit' ? t('sell.editListing') : t('sell.listThisHarvest')}</h2>

          <div className="field">
            <span>{t('sell.field.crop')}</span>
            <div className="field-readonly">
              {form.cropId ? cropName(form.cropId, lang) : form.cropId}
            </div>
          </div>

          <div className="field">
            <span>{t('sell.field.planted')}</span>
            <div className="field-readonly">
              {form.datePlanted ? formatShortDate(form.datePlanted, lang) : t('sell.unknown')}
            </div>
          </div>

          <label className="field">
            <span>{t('sell.field.neighborhood')}</span>
            <select
              value={form.neighborhoodKey}
              onChange={(event) => updateField('neighborhoodKey', event.target.value)}
              required
            >
              {NEIGHBORHOODS.map((neighborhood) => (
                <option key={neighborhood.key} value={neighborhood.key}>
                  {neighborhood.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('sell.field.displayName')}</span>
            <input
              type="text"
              placeholder={t('sell.field.displayNamePlaceholder')}
              value={form.displayName}
              onChange={(event) => updateField('displayName', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t('sell.field.unit')}</span>
            <select value={form.unit} onChange={(event) => updateField('unit', event.target.value)}>
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {t(unit.labelKey)}
                </option>
              ))}
            </select>
          </label>

          {form.unit !== 'free' && (
            <label className="field">
              <span>{t('sell.field.price')}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                required
              />
            </label>
          )}

          <label className="field">
            <span>{t('sell.field.photo')}</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          {photoError && <p className="sell-photo-error">{photoError}</p>}
          {form.photo && (
            <div className="sell-photo-preview">
              <img src={form.photo} alt={t("sell.field.photoPreviewAlt")} />
              <button type="button" onClick={() => updateField('photo', null)}>
                {t('sell.field.removePhoto')}
              </button>
            </div>
          )}

          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={form.snap}
              onChange={(event) => updateField('snap', event.target.checked)}
            />
            <span>{t('sell.field.snap')}</span>
          </label>

          {limitError && <p className="sell-photo-error">{t('sell.limitError')}</p>}

          <button type="submit" className="sell-submit">
            {form.mode === 'edit' ? t('sell.saveChanges') : t('sell.publishListing')}
          </button>
        </form>
      )}

      {(showBusinessForm || showNeighborForm) && submitted && (
        <div className="sell-success">
          <p>
            {form.mode === 'edit'
              ? t('sell.successUpdated')
              : form.sellerType === 'business'
                ? t('sell.successPosted')
                : t('sell.successPublished')}
          </p>
          <div className="sell-success-actions">
            {form.sellerType === 'neighbor' ? (
              <>
                <button
                  type="button"
                  className="sell-success-btn"
                  onClick={() => onViewInFindFood(form.neighborhoodKey)}
                >
                  {t('sell.viewInFindFood')}
                </button>
                <button
                  type="button"
                  className="sell-success-btn secondary"
                  onClick={onGoToGarden}
                >
                  {t('sell.backToGarden')}
                </button>
              </>
            ) : (
              <button type="button" className="sell-success-btn" onClick={handlePostAnother}>
                {t('sell.postAnother')}
              </button>
            )}
          </div>
        </div>
      )}

      {!showBusinessForm && form.mode === 'none' && (
        <div className="sell-empty">
          <p>{t('sell.emptyTitle')}</p>
          <p>{t('sell.emptyBody')}</p>
          <button type="button" className="sell-empty-btn" onClick={onGoToGarden}>
            {t('sell.goToGarden')}
          </button>
        </div>
      )}

      <div className="sell-listings">
        <h2>{t('sell.myListings')}</h2>
        {myListings.length === 0 ? (
          <p className="sell-listings-empty">{t('sell.noListingsYet')}</p>
        ) : (
          <ul className="sell-listings-list">
            {myListings.map((listing) => {
              const isBusinessListing = listing.sellerType === 'business'
              const cropLabel = isBusinessListing
                ? listing.cropName || cropName(listing.cropId, lang)
                : cropName(listing.cropId, lang)
              const linkedSource = isBusinessListing
                ? sources.find((s) => s.id === listing.linkedSourceId)
                : null
              const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
              const locationLabel = linkedSource ? linkedSource.name : neighborhood?.label
              const status = isBusinessListing
                ? {
                    text: listing.availableUntil
                      ? t('detail.availableUntil', {
                          date: formatShortDate(listing.availableUntil, lang),
                        })
                      : t('detail.availableUntilUnknown'),
                    open: true,
                  }
                : getReadyStatus(listing, now, lang)

              return (
                <li key={listing.id} className="sell-listing-card">
                  <div className="sell-listing-header">
                    <span className="place-name">{listing.displayName}</span>
                    <div className="sell-listing-buttons">
                      {isBusinessListing && onViewOnMap && (
                        <button
                          type="button"
                          className="sell-view-map-btn"
                          onClick={() => onViewOnMap(listing)}
                        >
                          {t('myMap.viewOnMap')}
                        </button>
                      )}
                      <button
                        type="button"
                        className="sell-edit-btn"
                        onClick={() => handleEditListing(listing)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        className="sell-remove-btn"
                        onClick={() => onRemoveListing(listing.id)}
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                  <div className="place-address">
                    {cropLabel} · {formatListingPrice(listing, lang)}
                    {locationLabel ? ` · ${locationLabel}` : ''}
                  </div>
                  <div className={`place-status${status.open ? ' open' : ''}`}>{status.text}</div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SellForm
