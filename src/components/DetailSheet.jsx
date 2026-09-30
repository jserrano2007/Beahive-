import { useEffect, useState } from 'react'
import { getWeekOrder, formatDayRanges, getSeasonInfo, getStatusLine, getTodayKey } from '../utils/hours'
import { directionsAddress } from '../utils/places'
import { categoryLabel } from '../utils/categories'
import { listingsForSource } from '../utils/listings'
import { useI18n } from '../i18n/useI18n'
import BusinessListingCard from './BusinessListingCard'
import './DetailSheet.css'

function programStatus(value, t) {
  if (value === true) return t('common.yes')
  if (typeof value === 'string') return value
  return t('common.notConfirmed')
}

function DetailSheet({ place, listings = [], now, onClose, onMessageSeller, onEditListing }) {
  const { t, lang } = useI18n()
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

  const statusLine = getStatusLine(displayPlace, now, lang)
  const todayKey = getTodayKey(now)
  const seasonInfo = getSeasonInfo(displayPlace.season, now, lang)
  const businessListings = listingsForSource(listings, displayPlace.id)
  const weekOrder = getWeekOrder(lang)

  return (
    <div
      className={`detail-backdrop${isOpen ? ' open' : ''}`}
      onClick={onClose}
      aria-hidden={!isOpen}
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
        <div className="detail-category">{categoryLabel(displayPlace.category, lang)}</div>
        <div className="detail-address">{displayPlace.address}</div>
        <div className={`detail-status${statusLine.open ? ' open' : ''}`}>{statusLine.text}</div>

        <a
          className="detail-directions-btn"
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(directionsAddress(displayPlace))}&travelmode=transit`}
          target="_blank"
          rel="noreferrer"
        >
          {t('detail.directions')}
        </a>

        <section className="detail-section">
          <h3>{t('detail.hours')}</h3>
          <ul className="detail-hours">
            {weekOrder.map((day) => (
              <li
                key={day.key}
                className={`detail-hours-row${day.key === todayKey ? ' today' : ''}`}
              >
                <span className="detail-hours-day">{day.label}</span>
                <span className="detail-hours-range">
                  {formatDayRanges(displayPlace.hours?.[day.key], lang)}
                </span>
              </li>
            ))}
          </ul>
          {displayPlace.season &&
            (seasonInfo.label ? (
              <div
                className={`detail-season${seasonInfo.inSeason ? '' : ' out-of-season'}`}
              >
                {seasonInfo.label}
              </div>
            ) : (
              <div className="detail-season">
                {t('hours.seasonRange', {
                  start: displayPlace.season.start,
                  end: displayPlace.season.end,
                })}
              </div>
            ))}
        </section>

        <section className="detail-section">
          <h3>{t('detail.assistancePrograms')}</h3>
          <ul className="detail-programs">
            <li>
              <span>{t('detail.snap')}</span>
              <span>{programStatus(displayPlace.snap, t)}</span>
            </li>
            <li>
              <span>{t('detail.snapMatch')}</span>
              <span>{programStatus(displayPlace.snapMatch, t)}</span>
            </li>
            <li>
              <span>{t('detail.wicFmnp')}</span>
              <span>{programStatus(displayPlace.wicFmnp, t)}</span>
            </li>
            <li>
              <span>{t('detail.seniorFmnp')}</span>
              <span>{programStatus(displayPlace.seniorFmnp, t)}</span>
            </li>
          </ul>
        </section>

        {(displayPlace.phone || displayPlace.website) && (
          <section className="detail-section detail-links">
            {displayPlace.phone && (
              <a href={`tel:${displayPlace.phone.replace(/[^\d+]/g, '')}`}>
                {displayPlace.phone}
              </a>
            )}
            {displayPlace.website && (
              <a href={displayPlace.website} target="_blank" rel="noreferrer">
                {t('detail.visitWebsite')}
              </a>
            )}
          </section>
        )}

        {businessListings.length > 0 && (
          <section className="detail-section">
            <h3>{t('detail.availableThisWeek')}</h3>
            <ul className="feed-list">
              {businessListings.map((listing) => (
                <BusinessListingCard
                  key={listing.id}
                  listing={listing}
                  onMessageSeller={onMessageSeller}
                  onEditListing={onEditListing}
                />
              ))}
            </ul>
          </section>
        )}

        {displayPlace.notes && (
          <section className="detail-section">
            <h3>{t('detail.notes')}</h3>
            <p className="detail-notes">{displayPlace.notes}</p>
          </section>
        )}

        {displayPlace.sourceUrl && (
          <a
            className="detail-source-link"
            href={displayPlace.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('detail.sourceLink')}
          </a>
        )}
      </div>
    </div>
  )
}

export default DetailSheet
