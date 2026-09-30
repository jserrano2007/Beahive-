import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { useI18n } from '../i18n/useI18n'
import './LocationControls.css'

function LocationControls({
  selectedNeighborhood,
  locationStatus,
  onUseMyLocation,
  onSelectNeighborhood,
}) {
  const { t } = useI18n()

  return (
    <div className="location-controls">
      <div className="location-controls-row">
        <button
          type="button"
          className="location-btn"
          onClick={onUseMyLocation}
          disabled={locationStatus === 'locating'}
          aria-busy={locationStatus === 'locating'}
        >
          {locationStatus === 'locating' ? (
            <>
              <span className="location-spinner" aria-hidden="true" />
              {t('findFood.findingYou')}
            </>
          ) : (
            t('findFood.useMyLocation')
          )}
        </button>
        <select
          className="neighborhood-select"
          value={selectedNeighborhood}
          onChange={(event) => onSelectNeighborhood(event.target.value)}
          aria-label={t('findFood.chooseNeighborhood')}
        >
          <option value="">{t('findFood.chooseNeighborhood')}</option>
          {NEIGHBORHOODS.map((neighborhood) => (
            <option key={neighborhood.key} value={neighborhood.key}>
              {neighborhood.label}
            </option>
          ))}
        </select>
      </div>
      {locationStatus === 'error' && (
        <p className="location-message">{t('findFood.locationError')}</p>
      )}
    </div>
  )
}

export default LocationControls
