import { useEffect, useRef } from 'react'
import { cropName } from '../utils/crops'
import { formatListingPrice } from '../utils/listings'
import { formatShortDate } from '../utils/dates'
import { categoryColor } from '../utils/categories'
import { recordListingView, recordMessageTap } from '../data/store'
import { useI18n } from '../i18n/useI18n'

function BusinessListingCard({ listing, onMessageSeller, onEditListing }) {
  const { t, lang } = useI18n()
  const isOwnerView = Boolean(onEditListing)
  const cropLabel = listing.cropName || cropName(listing.cropId, lang)
  const recordedViewRef = useRef(false)

  useEffect(() => {
    if (isOwnerView) return
    if (recordedViewRef.current) return
    recordedViewRef.current = true
    recordListingView(listing.id, cropLabel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id, isOwnerView])

  function handleMessageSeller() {
    recordMessageTap(listing.id, cropLabel)
    onMessageSeller(listing)
  }

  return (
    <li className="feed-card">
      <div className="feed-card-photo">
        {listing.photo ? (
          <img src={listing.photo} alt={cropLabel} />
        ) : (
          <div className="feed-card-placeholder" style={{ background: categoryColor('business') }}>
            {cropLabel}
          </div>
        )}
      </div>
      <div className="feed-card-body">
        <div className="feed-card-header">
          <span className="feed-card-crop">{cropLabel}</span>
          <span className="feed-card-price">{formatListingPrice(listing, lang)}</span>
        </div>
        <div className="place-status open">
          {listing.availableUntil
            ? t('detail.availableUntil', { date: formatShortDate(listing.availableUntil, lang) })
            : t('detail.availableUntilUnknown')}
        </div>
        {listing.snap && <span className="snap-badge">{t('detail.snap')}</span>}
        <div className="feed-card-actions">
          {isOwnerView ? (
            <button
              type="button"
              className="edit-in-sell-btn"
              onClick={() => onEditListing(listing)}
            >
              {t('myMap.editInSell')}
            </button>
          ) : (
            <button type="button" className="message-seller-btn" onClick={handleMessageSeller}>
              {t('detail.messageSeller')}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

export default BusinessListingCard
