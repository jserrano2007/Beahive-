import { useEffect, useMemo, useState } from 'react'
import Map from './Map'
import DetailSheet from './DetailSheet'
import BusinessPlaceSheet from './BusinessPlaceSheet'
import { HARTFORD_CENTER } from '../utils/places'
import { cropName } from '../utils/crops'
import { formatListingPrice, groupBusinessListingsByNeighborhood } from '../utils/listings'
import { formatShortDate } from '../utils/dates'
import { getListingViewCount } from '../data/store'
import { useI18n } from '../i18n/useI18n'
import './MyMapTab.css'

function MyMapTab({
  account = {},
  listings = [],
  sources = [],
  now,
  focusListingId,
  onConsumeFocusListing,
  onGoToSell,
  onListForSale,
}) {
  const { t, tCount, lang } = useI18n()

  const businessListings = useMemo(
    () => listings.filter((l) => l.sellerType === 'business' && !l.demo),
    [listings],
  )
  const linkedListings = useMemo(
    () => businessListings.filter((l) => l.linkedSourceId),
    [businessListings],
  )
  const unlinkedListings = useMemo(
    () => businessListings.filter((l) => !l.linkedSourceId),
    [businessListings],
  )

  const linkedSourceId = linkedListings[0]?.linkedSourceId ?? account.linkedSourceId ?? null
  const linkedSource = linkedSourceId ? sources.find((s) => s.id === linkedSourceId) : null

  const unlinkedGroup = useMemo(
    () => groupBusinessListingsByNeighborhood(unlinkedListings, lang)[0] ?? null,
    [unlinkedListings, lang],
  )

  const mapPlaces = useMemo(() => {
    const result = []
    if (linkedSource) result.push(linkedSource)
    if (unlinkedGroup) result.push(unlinkedGroup)
    return result
  }, [linkedSource, unlinkedGroup])

  function findListingPlace(listing) {
    if (!listing) return { place: null, isBusinessPlace: false }
    if (listing.linkedSourceId) {
      const source = sources.find((s) => s.id === listing.linkedSourceId)
      return { place: source ?? null, isBusinessPlace: false }
    }
    return { place: unlinkedGroup, isBusinessPlace: true }
  }

  const [selectedPlace, setSelectedPlace] = useState(() => {
    if (!focusListingId) return null
    const listing = businessListings.find((l) => l.id === focusListingId)
    const { place, isBusinessPlace } = findListingPlace(listing)
    return !isBusinessPlace ? place : null
  })
  const [selectedBusinessPlace, setSelectedBusinessPlace] = useState(() => {
    if (!focusListingId) return null
    const listing = businessListings.find((l) => l.id === focusListingId)
    const { place, isBusinessPlace } = findListingPlace(listing)
    return isBusinessPlace ? place : null
  })

  useEffect(() => {
    if (focusListingId) onConsumeFocusListing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelectPlace(place) {
    if (place.isBusinessPlace) {
      setSelectedBusinessPlace(place)
    } else {
      setSelectedPlace(place)
    }
  }

  function handleSelectListingRow(listing) {
    const { place, isBusinessPlace } = findListingPlace(listing)
    if (!place) return
    if (isBusinessPlace) {
      setSelectedBusinessPlace(place)
    } else {
      setSelectedPlace(place)
    }
  }

  function handleEditListing(listing) {
    onListForSale({ mode: 'edit', listing })
  }

  return (
    <div className="my-map-tab">
      {businessListings.length === 0 ? (
        <div className="my-map-empty">
          <p>{t('myMap.emptyTitle')}</p>
          <button type="button" className="my-map-empty-btn" onClick={onGoToSell}>
            {t('myMap.createListing')}
          </button>
        </div>
      ) : (
        <>
          <Map
            places={mapPlaces}
            onSelectPlace={handleSelectPlace}
            center={mapPlaces[0] ? { lat: mapPlaces[0].lat, lng: mapPlaces[0].lng } : HARTFORD_CENTER}
            fitBounds
          />

          <ul className="my-map-listing-list">
            {businessListings.map((listing) => {
              const crop = listing.cropName || cropName(listing.cropId, lang)
              const viewCount = getListingViewCount(listing.id)
              return (
                <li
                  key={listing.id}
                  className="my-map-listing-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectListingRow(listing)}
                >
                  <div className="my-map-listing-main">
                    <span className="my-map-listing-crop">{crop}</span>
                    <span className="my-map-listing-price">{formatListingPrice(listing, lang)}</span>
                  </div>
                  <div className="my-map-listing-meta">
                    {listing.availableUntil && (
                      <span>
                        {t('myMap.availableUntil', {
                          date: formatShortDate(listing.availableUntil, lang),
                        })}
                      </span>
                    )}
                    {viewCount > 0 && <span>{tCount('insights.view', viewCount)}</span>}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <DetailSheet
        place={selectedPlace}
        listings={listings}
        now={now}
        onClose={() => setSelectedPlace(null)}
        onEditListing={handleEditListing}
      />
      <BusinessPlaceSheet
        place={selectedBusinessPlace}
        onClose={() => setSelectedBusinessPlace(null)}
        onEditListing={handleEditListing}
      />
    </div>
  )
}

export default MyMapTab
