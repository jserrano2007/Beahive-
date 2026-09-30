import { useEffect, useState } from 'react'
import { cropName } from '../utils/crops'
import { formatListingPrice, getReadyWindow } from '../utils/listings'
import { formatShortDate, toDateStr } from '../utils/dates'
import { categoryColor } from '../utils/categories'
import { recordMessageTap, getSellerRating } from '../data/store'
import { useI18n } from '../i18n/useI18n'
import './NeighborhoodSheet.css'

function StarRating({ listing, t }) {
  const rating = getSellerRating(listing)
  if (!rating) return <span className="seller-rating new">{t('common.newSeller')}</span>
  const rounded = Math.round(rating.average)
  const stars = '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(rounded)
  return (
    <span className="seller-rating">
      <span className="seller-stars" aria-hidden="true">
        {stars}
      </span>
      {rating.average.toFixed(1)} (
      {t(rating.count === 1 ? 'common.review_one' : 'common.review_other', { count: rating.count })}
      )
    </span>
  )
}

function ListingCard({ listing, now, onMessageSeller }) {
  const { t, lang } = useI18n()
  const cropLabel = cropName(listing.cropId, lang)

  const readyWindow = getReadyWindow(listing.datePlanted, listing.cropId)
  const today = toDateStr(now)
  const isReadyNow = Boolean(readyWindow) && today >= readyWindow.start && today <= readyWindow.end
  const readyText = isReadyNow
    ? t('findFood.readyNow')
    : readyWindow
      ? t('findFood.readyAround', { date: formatShortDate(readyWindow.start, lang) })
      : t('findFood.readyDateUnknown')

  function handleMessageSeller() {
    recordMessageTap(listing.id, cropLabel)
    onMessageSeller(listing)
  }

  return (
    <li className="feed-card">
      {listing.demo && <span className="demo-tag">{t('common.demo')}</span>}
      <div className="feed-card-photo">
        {listing.photo ? (
          <img src={listing.photo} alt={cropLabel} />
        ) : (
          <div
            className="feed-card-placeholder"
            style={{ background: categoryColor('home_grower') }}
          >
            {cropLabel}
          </div>
        )}
      </div>
      <div className="feed-card-body">
        <div className="feed-card-header">
          <span className="feed-card-crop">{cropLabel}</span>
          <span className="feed-card-price">{formatListingPrice(listing, lang)}</span>
        </div>
        <div className={`place-status${isReadyNow ? ' open' : ''}`}>{readyText}</div>
        <div className="feed-card-seller">{listing.displayName}</div>
        <StarRating listing={listing} t={t} />
        {listing.snap && <span className="snap-badge">{t('detail.snap')}</span>}
        <div className="feed-card-actions">
          <button type="button" className="message-seller-btn" onClick={handleMessageSeller}>
            {t('detail.messageSeller')}
          </button>
        </div>
      </div>
    </li>
  )
}

function NeighborhoodSheet({ group, now, onClose, onMessageSeller }) {
  const { t, tCount } = useI18n()
  const [displayGroup, setDisplayGroup] = useState(group)
  const isOpen = Boolean(group)

  if (group && group !== displayGroup) {
    setDisplayGroup(group)
  }

  useEffect(() => {
    if (!isOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!displayGroup) return null

  return (
    <div
      className={`detail-backdrop${isOpen ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className={`detail-sheet neighborhood-sheet${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={displayGroup.neighborhoodLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="detail-close" onClick={onClose} aria-label={t('common.close')}>
          ×
        </button>

        <h2 className="detail-name">
          {tCount('findFood.neighborhoodListings', displayGroup.count, {
            neighborhood: displayGroup.neighborhoodLabel,
          })}
        </h2>

        <ul className="feed-list">
          {(displayGroup.listings ?? []).map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              now={now}
              onMessageSeller={onMessageSeller}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default NeighborhoodSheet
