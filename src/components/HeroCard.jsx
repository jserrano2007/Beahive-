import LocationControls from './LocationControls'
import { useI18n } from '../i18n/useI18n'
import './HeroCard.css'

function HeroCard({
  openNowCount,
  selectedNeighborhood,
  locationStatus,
  onUseMyLocation,
  onSelectNeighborhood,
}) {
  const { tCount } = useI18n()

  return (
    <div className="hero-card">
      <div className="hero-stat">{openNowCount}</div>
      <p className="hero-caption">{tCount('findFood.heroCaption', openNowCount)}</p>
      <LocationControls
        selectedNeighborhood={selectedNeighborhood}
        locationStatus={locationStatus}
        onUseMyLocation={onUseMyLocation}
        onSelectNeighborhood={onSelectNeighborhood}
      />
    </div>
  )
}

export default HeroCard
