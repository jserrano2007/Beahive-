import { useEffect, useMemo, useState } from 'react'
import Map from './Map'
import PlaceList from './PlaceList'
import FilterBar from './FilterBar'
import SearchBar from './SearchBar'
import DetailSheet from './DetailSheet'
import NeighborhoodSheet from './NeighborhoodSheet'
import BusinessPlaceSheet from './BusinessPlaceSheet'
import HeroCard from './HeroCard'
import CategoryLegend from './CategoryLegend'
import OpensNextCard from './OpensNextCard'
import WinterBanner from './WinterBanner'
import BenefitsInfo from './BenefitsInfo'
import { HARTFORD_CENTER, distanceMiles, hasCoords } from '../utils/places'
import { getNextOpening, getSeasonInfo, isOpenNow } from '../utils/hours'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { STORE_CHIPS, NEIGHBOR_CHIPS } from '../utils/filterChips'
import {
  getReadyStatus,
  groupBusinessListingsByNeighborhood,
  groupListingsByNeighborhood,
} from '../utils/listings'
import { getCropById, cropName as getCropDisplayName } from '../utils/crops'
import { recordSearchMatch } from '../data/store'
import { useI18n } from '../i18n/useI18n'
import './FindFoodTab.css'

const CATEGORY_GROUPS = {
  markets: ['farmers_market'],
  grocery: ['grocery', 'small_grocery'],
  farms: ['urban_farm', 'community_garden'],
  freeFood: ['food_pantry'],
}

const INITIAL_FILTERS = {
  openNow: false,
  snap: false,
  markets: false,
  grocery: false,
  farms: false,
  freeFood: false,
  readyNow: false,
}

const MIN_OPEN_NOW_RESULTS = 3
const MIN_IN_SEASON_MARKETS = 2
const MAX_SEARCH_RESULTS = 8

function FindFoodTab({
  sources = [],
  listings = [],
  account = {},
  now,
  openNeighborhoodKey,
  onConsumeOpenNeighborhood,
  onMessageSeller,
}) {
  const { t, lang } = useI18n()
  const [view, setView] = useState(() => (openNeighborhoodKey ? 'neighbors' : 'stores'))
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedBusinessPlace, setSelectedBusinessPlace] = useState(null)
  const [selectedGroupKey, setSelectedGroupKey] = useState(() => openNeighborhoodKey || null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    () => account.preferredNeighborhood || '',
  )
  const [center, setCenter] = useState(() => {
    const preferred = NEIGHBORHOODS.find((n) => n.key === account.preferredNeighborhood)
    return preferred ? { lat: preferred.lat, lng: preferred.lng } : HARTFORD_CENTER
  })
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [searchQuery, setSearchQuery] = useState('')

  function toggleFilter(key) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function applyFilter(key) {
    if (key === 'neighbors') {
      setView('neighbors')
      return
    }
    setView('stores')
    setFilters((prev) => ({ ...prev, [key]: true }))
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }
    setLocationStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
        setUserLocation(coords)
        setCenter(coords)
        setSelectedNeighborhood('')
        setLocationStatus('idle')
      },
      () => {
        setLocationStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function handleSelectNeighborhood(key) {
    setSelectedNeighborhood(key)
    setLocationStatus('idle')
    const neighborhood = NEIGHBORHOODS.find((n) => n.key === key)
    setUserLocation(null)
    setCenter(neighborhood ? { lat: neighborhood.lat, lng: neighborhood.lng } : HARTFORD_CENTER)
  }

  function handleSelectPlace(place) {
    if (place.isNeighborhoodGroup) {
      setSelectedGroupKey(place.neighborhoodKey)
    } else if (place.isBusinessPlace) {
      setSelectedBusinessPlace(place)
    } else {
      setSelectedPlace(place)
    }
  }

  useEffect(() => {
    if (openNeighborhoodKey) onConsumeOpenNeighborhood()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const businessListings = useMemo(
    () => listings.filter((listing) => listing.sellerType === 'business'),
    [listings],
  )
  const neighborListings = useMemo(
    () => listings.filter((listing) => listing.sellerType !== 'business'),
    [listings],
  )
  const unlinkedBusinessGroups = useMemo(
    () => groupBusinessListingsByNeighborhood(businessListings, lang),
    [businessListings, lang],
  )

  const allowedCategories = useMemo(() => {
    const activeCategoryKeys = Object.keys(CATEGORY_GROUPS).filter((key) => filters[key])
    return activeCategoryKeys.length
      ? activeCategoryKeys.flatMap((key) => CATEGORY_GROUPS[key])
      : null
  }, [filters])

  const sourcesMatchingOtherFilters = useMemo(
    () =>
      sources.filter((place) => {
        if (allowedCategories && !allowedCategories.includes(place.category)) return false
        if (filters.snap && place.snap !== true) return false
        return true
      }),
    [sources, allowedCategories, filters.snap],
  )

  const businessGroupsMatchingOtherFilters = useMemo(
    () =>
      unlinkedBusinessGroups.filter((group) => {
        if (allowedCategories && !allowedCategories.includes('business')) return false
        if (filters.snap && !group.listings.some((listing) => listing.snap)) return false
        return true
      }),
    [unlinkedBusinessGroups, allowedCategories, filters.snap],
  )

  const storesFiltered = useMemo(() => {
    const combined = [...sourcesMatchingOtherFilters, ...businessGroupsMatchingOtherFilters]
    if (!filters.openNow) return combined
    return combined.filter((place) => place.isBusinessPlace || isOpenNow(place, now))
  }, [sourcesMatchingOtherFilters, businessGroupsMatchingOtherFilters, filters.openNow, now])

  const openNowCount = useMemo(
    () => sourcesMatchingOtherFilters.filter((place) => isOpenNow(place, now)).length,
    [sourcesMatchingOtherFilters, now],
  )

  const openNowCandidates = useMemo(() => {
    if (!filters.openNow || view !== 'stores' || openNowCount >= MIN_OPEN_NOW_RESULTS) return []

    const storeCandidates = sourcesMatchingOtherFilters
      .filter((place) => !isOpenNow(place, now))
      .map((place) => {
        const nextOpening = getNextOpening(place, now, lang)
        if (!nextOpening) return null
        return {
          key: `store-${place.id}`,
          type: 'store',
          place,
          name: place.name,
          typeLabel: t('findFood.resultTypeStore'),
          text: nextOpening.text,
          sortValue: nextOpening.date.getTime(),
          distance: hasCoords(place)
            ? distanceMiles(center.lat, center.lng, place.lat, place.lng)
            : null,
        }
      })
      .filter(Boolean)

    const neighborCandidates = neighborListings
      .filter((listing) => getReadyStatus(listing, now, lang).open)
      .map((listing) => {
        const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
        return {
          key: `neighbor-${listing.id}`,
          type: 'neighbor',
          listing,
          name: getCropDisplayName(listing.cropId, lang),
          typeLabel: t('findFood.resultTypeNeighbor'),
          text: t('findFood.readyNow'),
          sortValue: 0,
          distance: neighborhood
            ? distanceMiles(center.lat, center.lng, neighborhood.lat, neighborhood.lng)
            : null,
        }
      })

    return [...neighborCandidates, ...storeCandidates]
      .sort((a, b) => a.sortValue - b.sortValue)
      .slice(0, MIN_OPEN_NOW_RESULTS)
  }, [
    sourcesMatchingOtherFilters,
    neighborListings,
    filters.openNow,
    view,
    openNowCount,
    now,
    center,
    lang,
    t,
  ])

  const farmersMarketsInSeasonCount = useMemo(
    () =>
      sources.filter(
        (place) => place.category === 'farmers_market' && getSeasonInfo(place.season, now).inSeason,
      ).length,
    [sources, now],
  )
  const showWinterBanner = farmersMarketsInSeasonCount < MIN_IN_SEASON_MARKETS

  const neighborhoodGroups = useMemo(() => {
    let eligibleListings = neighborListings
    if (filters.snap) eligibleListings = eligibleListings.filter((l) => l.snap === true)
    if (filters.readyNow) {
      eligibleListings = eligibleListings.filter((l) => getReadyStatus(l, now, lang).open)
    }
    return groupListingsByNeighborhood(eligibleListings, lang)
  }, [neighborListings, filters.snap, filters.readyNow, now, lang])

  const selectedGroup = selectedGroupKey
    ? (neighborhoodGroups.find((group) => group.neighborhoodKey === selectedGroupKey) ?? null)
    : null

  const viewPlaces = view === 'stores' ? storesFiltered : neighborhoodGroups
  const chips = view === 'stores' ? STORE_CHIPS : NEIGHBOR_CHIPS

  const storesCount = sources.length + unlinkedBusinessGroups.length
  const neighborsCount = neighborListings.length

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    const results = []
    const matchedTargetIds = new Set()

    sources.forEach((place) => {
      if (place.name.toLowerCase().includes(query)) {
        results.push({
          key: `store-${place.id}`,
          type: 'store',
          name: place.name,
          typeLabel: t('findFood.resultTypeStore'),
          subtitle: place.address,
          target: place,
        })
        matchedTargetIds.add(`source-${place.id}`)
      }
    })

    businessListings.forEach((listing) => {
      const crop = listing.cropName || getCropById(listing.cropId)?.name || ''
      const haystack = `${listing.displayName ?? ''} ${crop}`.toLowerCase()
      if (!haystack.includes(query)) return

      if (listing.linkedSourceId) {
        if (matchedTargetIds.has(`source-${listing.linkedSourceId}`)) return
        const place = sources.find((s) => s.id === listing.linkedSourceId)
        if (!place) return
        matchedTargetIds.add(`source-${place.id}`)
        results.push({
          key: `store-${place.id}`,
          type: 'store',
          name: place.name,
          typeLabel: t('findFood.resultTypeStore'),
          subtitle: t('findFood.cropAvailable', { crop }),
          target: place,
        })
      } else {
        const group = unlinkedBusinessGroups.find((g) =>
          g.listings.some((l) => l.id === listing.id),
        )
        if (!group || matchedTargetIds.has(group.id)) return
        matchedTargetIds.add(group.id)
        results.push({
          key: `store-${group.id}`,
          type: 'store',
          name: group.name,
          typeLabel: t('findFood.resultTypeStore'),
          subtitle: t('findFood.cropAvailable', { crop }),
          target: group,
        })
      }
    })

    neighborListings.forEach((listing) => {
      const crop = getCropDisplayName(listing.cropId, lang)
      const neighborhood = NEIGHBORHOODS.find((n) => n.key === listing.neighborhoodKey)
      const haystack = `${crop} ${listing.displayName} ${neighborhood?.label ?? ''}`.toLowerCase()
      if (!haystack.includes(query)) return
      results.push({
        key: `neighbor-${listing.id}`,
        type: 'neighbor',
        name: crop,
        typeLabel: t('findFood.resultTypeNeighbor'),
        subtitle: `${listing.displayName}${neighborhood ? ` · ${neighborhood.label}` : ''}`,
        target: listing,
      })
    })

    return results.slice(0, MAX_SEARCH_RESULTS)
  }, [searchQuery, sources, businessListings, unlinkedBusinessGroups, neighborListings, lang, t])

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return
    businessListings.forEach((listing) => {
      const cropName = listing.cropName || getCropById(listing.cropId)?.name || ''
      const haystack = `${listing.displayName ?? ''} ${cropName}`.toLowerCase()
      if (haystack.includes(query)) {
        recordSearchMatch(listing.id, cropName)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  function handleSelectSearchResult(result) {
    setSearchQuery('')
    if (result.type === 'store') {
      setView('stores')
      handleSelectPlace(result.target)
    } else {
      setView('neighbors')
      setSelectedGroupKey(result.target.neighborhoodKey)
    }
  }

  function handleSelectOpensNextCandidate(candidate) {
    if (candidate.type === 'store') {
      setView('stores')
      handleSelectPlace(candidate.place)
    } else {
      setView('neighbors')
      setSelectedGroupKey(candidate.listing.neighborhoodKey)
    }
  }

  return (
    <>
      <HeroCard
        openNowCount={openNowCount}
        selectedNeighborhood={selectedNeighborhood}
        locationStatus={locationStatus}
        onUseMyLocation={handleUseMyLocation}
        onSelectNeighborhood={handleSelectNeighborhood}
      />
      {showWinterBanner && <WinterBanner onApplyFilter={applyFilter} />}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchResults}
        onSelect={handleSelectSearchResult}
      />
      <div className="view-toggle">
        <button
          type="button"
          className={`view-toggle-btn${view === 'stores' ? ' active' : ''}`}
          onClick={() => setView('stores')}
        >
          {t('findFood.viewStores')} <span className="view-toggle-count">{storesCount}</span>
        </button>
        <button
          type="button"
          className={`view-toggle-btn${view === 'neighbors' ? ' active' : ''}`}
          onClick={() => setView('neighbors')}
        >
          {t('findFood.viewNeighbors')} <span className="view-toggle-count">{neighborsCount}</span>
        </button>
      </div>
      {view === 'stores' && <CategoryLegend />}
      <Map
        places={viewPlaces}
        onSelectPlace={handleSelectPlace}
        center={center}
        userLocation={userLocation}
      />
      <BenefitsInfo />
      <FilterBar filters={filters} chips={chips} onToggle={toggleFilter} />
      {view === 'stores' && (
        <OpensNextCard
          openNowCount={openNowCount}
          candidates={openNowCandidates}
          onSelect={handleSelectOpensNextCandidate}
        />
      )}
      <PlaceList
        places={viewPlaces}
        now={now}
        onSelectPlace={handleSelectPlace}
        center={center}
      />
      <DetailSheet
        place={selectedPlace}
        listings={listings}
        now={now}
        onClose={() => setSelectedPlace(null)}
        onMessageSeller={onMessageSeller}
      />
      <NeighborhoodSheet
        group={selectedGroup}
        now={now}
        onClose={() => setSelectedGroupKey(null)}
        onMessageSeller={onMessageSeller}
      />
      <BusinessPlaceSheet
        place={selectedBusinessPlace}
        onClose={() => setSelectedBusinessPlace(null)}
        onMessageSeller={onMessageSeller}
      />
    </>
  )
}

export default FindFoodTab
