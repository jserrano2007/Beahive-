import { HARTFORD_CENTER, distanceMiles, hasCoords } from '../utils/places'
import { categoryColor, categoryLabel } from '../utils/categories'
import { getNow, getSeasonInfo, getStatusLine } from '../utils/hours'
import { useI18n } from '../i18n/useI18n'
import './PlaceList.css'

function PlaceList({ places = [], now = getNow(), onSelectPlace, center = HARTFORD_CENTER }) {
  const { t, lang } = useI18n()
  const sorted = [...places].sort((a, b) => {
    const aHas = hasCoords(a)
    const bHas = hasCoords(b)
    if (aHas && !bHas) return -1
    if (!aHas && bHas) return 1
    if (!aHas && !bHas) return 0

    const aInSeason = a.isNeighborhoodGroup || a.isBusinessPlace || getSeasonInfo(a.season, now).inSeason
    const bInSeason = b.isNeighborhoodGroup || b.isBusinessPlace || getSeasonInfo(b.season, now).inSeason
    if (aInSeason !== bInSeason) return aInSeason ? -1 : 1

    return (
      distanceMiles(center.lat, center.lng, a.lat, a.lng) -
      distanceMiles(center.lat, center.lng, b.lat, b.lng)
    )
  })

  return (
    <ul className="place-list">
      {sorted.map((place) => {
        const isGroup = place.isNeighborhoodGroup
        const isBusinessPlace = place.isBusinessPlace
        const skipStatus = isGroup || isBusinessPlace
        const statusLine = skipStatus ? null : getStatusLine(place, now, lang)
        const seasonInfo = skipStatus ? null : getSeasonInfo(place.season, now, lang)
        const outOfSeason = Boolean(seasonInfo && !seasonInfo.inSeason)
        return (
          <li
            key={place.id}
            className={`place-card${outOfSeason ? ' out-of-season' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelectPlace(place)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectPlace(place)
              }
            }}
          >
            <div className="place-card-header">
              <span className="place-name">{place.name}</span>
              {hasCoords(place) && (
                <span className="place-distance">
                  {distanceMiles(center.lat, center.lng, place.lat, place.lng).toFixed(1)}{' '}
                  {t('common.milesAbbrev')}
                </span>
              )}
            </div>
            <div className="place-category" style={{ color: categoryColor(place.category) }}>
              {isGroup
                ? t('findFood.viewNeighbors')
                : isBusinessPlace
                  ? t('categories.business')
                  : categoryLabel(place.category, lang)}
            </div>
            {skipStatus ? (
              <div className="place-status">{t('findFood.tapToSeeListings')}</div>
            ) : (
              <>
                <div className="place-address">{place.address}</div>
                <div className={`place-status${statusLine.open ? ' open' : ''}`}>
                  {statusLine.text}
                </div>
                {seasonInfo.label && <div className="place-season">{seasonInfo.label}</div>}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default PlaceList
