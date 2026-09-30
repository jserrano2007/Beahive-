import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import BusinessListingCard from './BusinessListingCard'

function BusinessPlaceSheet({ place, onClose, onMessageSeller, onEditListing }) {
  const { t } = useI18n()
  const [displayPlace, setDisplayPlace] = useState(place)
  const isOpen = Boolean(place)

  if (place && place !== displayPlace) {
    setDisplayPlace(place)
  }

  useEffect(() => {
    if (!isOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!displayPlace) return null

  return (
    <div
      className={`detail-backdrop${isOpen ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        className={`detail-sheet${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={displayPlace.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="detail-close" onClick={onClose} aria-label={t('common.close')}>
          ×
        </button>

        {onEditListing && (
          <div className="customer-view-banner">{t('myMap.customerViewBanner')}</div>
        )}

        <h2 className="detail-name">{displayPlace.name}</h2>
        <div className="detail-category">{t('categories.business')}</div>
        <div className="detail-address">{displayPlace.address}</div>

        <ul className="feed-list">
          {(displayPlace.listings ?? []).map((listing) => (
            <BusinessListingCard
              key={listing.id}
              listing={listing}
              onMessageSeller={onMessageSeller}
              onEditListing={onEditListing}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default BusinessPlaceSheet
