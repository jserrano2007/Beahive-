import { useI18n } from '../i18n/useI18n'
import './OpensNextCard.css'

function OpensNextCard({ openNowCount, candidates = [], onSelect }) {
  const { t } = useI18n()
  if (candidates.length === 0) return null

  const heading =
    openNowCount === 0
      ? t('findFood.opensNextHeadingZero')
      : openNowCount === 1
        ? t('findFood.opensNextHeadingOne')
        : t('findFood.opensNextHeadingMany', { count: openNowCount })

  return (
    <div className="opens-next-card">
      <h3>{heading}</h3>
      <ul className="opens-next-list">
        {candidates.map((candidate) => (
          <li
            key={candidate.key}
            className="opens-next-item"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(candidate)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(candidate)
              }
            }}
          >
            <span className="opens-next-name">
              {candidate.name}
              <span className={`opens-next-type${candidate.type === 'neighbor' ? ' neighbor' : ''}`}>
                {candidate.typeLabel}
              </span>
            </span>
            <span className="opens-next-text">{candidate.text}</span>
            {candidate.distance != null && (
              <span className="opens-next-distance">
                {candidate.distance.toFixed(1)} {t('common.milesAbbrev')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OpensNextCard
