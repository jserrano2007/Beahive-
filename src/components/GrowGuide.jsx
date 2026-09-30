import { useState } from 'react'
import { cropName } from '../utils/crops'
import { useI18n } from '../i18n/useI18n'
import {
  LIGHT_OPTIONS,
  METHODS,
  SPACE_OPTIONS,
  recommend,
} from '../data/growGuide'
import './GrowGuide.css'

function optionLabel(t, kind, key) {
  return t(`growGuide.${kind}.${key}.label`)
}

function optionHint(t, kind, key) {
  return t(`growGuide.${kind}.${key}.hint`)
}

function findOptionKey(options, key) {
  return options.find((option) => option.key === key)?.key ?? null
}

function GrowGuide({ learnMode = false, onStartTracking }) {
  const { t, lang } = useI18n()
  const [space, setSpace] = useState(null)
  const [light, setLight] = useState(null)
  const [expandedMethodId, setExpandedMethodId] = useState(null)

  const step = space == null ? 'space' : light == null ? 'light' : 'results'
  const methods = step === 'results' ? recommend(space, light) : []
  const note = step === 'results' && light === 'low' ? t('growGuide.lowLightNote') : null

  function pickSpace(key) {
    setSpace(key)
    setLight(null)
    setExpandedMethodId(null)
  }

  function pickLight(key) {
    setLight(key)
    const first = recommend(space, key)[0]
    setExpandedMethodId(first?.id ?? null)
  }

  function reset() {
    setSpace(null)
    setLight(null)
    setExpandedMethodId(null)
  }

  function toggleMethod(id) {
    setExpandedMethodId((prev) => (prev === id ? null : id))
  }

  const spaceKey = findOptionKey(SPACE_OPTIONS, space)
  const lightKey = findOptionKey(LIGHT_OPTIONS, light)

  return (
    <div className="grow-guide">
      <header className="gg-header">
        <p className="gg-eyebrow">{t('growGuide.eyebrow')}</p>
        <h2 className="gg-title">{t('growGuide.title')}</h2>
        <p className="gg-sub">{t('growGuide.sub')}</p>
      </header>

      <ol className="gg-progress" aria-label={t('growGuide.progressAria')}>
        <li className={`gg-progress-step${step !== 'space' ? ' done' : ''}${step === 'space' ? ' current' : ''}`}>
          1
        </li>
        <li className={`gg-progress-step${step === 'results' ? ' done' : ''}${step === 'light' ? ' current' : ''}${step === 'space' ? ' pending' : ''}`}>
          2
        </li>
        <li className={`gg-progress-step${step === 'results' ? ' current' : ' pending'}`}>
          ✓
        </li>
      </ol>

      {step === 'space' && (
        <section className="gg-question" aria-labelledby="gg-space-heading">
          <h3 id="gg-space-heading" className="gg-q-heading">
            {t('growGuide.spaceHeading')}
          </h3>
          <ul className="gg-option-list">
            {SPACE_OPTIONS.map((option) => (
              <li key={option.key}>
                <button
                  type="button"
                  className="gg-option-btn"
                  onClick={() => pickSpace(option.key)}
                >
                  <span className="gg-option-label">{optionLabel(t, 'space', option.key)}</span>
                  <span className="gg-option-hint">{optionHint(t, 'space', option.key)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 'light' && (
        <section className="gg-question" aria-labelledby="gg-light-heading">
          <div className="gg-back-row">
            <button type="button" className="gg-back-btn" onClick={() => setSpace(null)}>
              {t('common.back')}
            </button>
            <span className="gg-picked-chip">{optionLabel(t, 'space', spaceKey)}</span>
          </div>
          <h3 id="gg-light-heading" className="gg-q-heading">
            {t('growGuide.lightHeading')}
          </h3>
          <ul className="gg-option-list">
            {LIGHT_OPTIONS.map((option) => (
              <li key={option.key}>
                <button
                  type="button"
                  className="gg-option-btn"
                  onClick={() => pickLight(option.key)}
                >
                  <span className="gg-option-label">{optionLabel(t, 'light', option.key)}</span>
                  <span className="gg-option-hint">{optionHint(t, 'light', option.key)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 'results' && (
        <section className="gg-results" aria-labelledby="gg-results-heading">
          <div className="gg-summary">
            <div className="gg-summary-chips">
              <span className="gg-picked-chip">{optionLabel(t, 'space', spaceKey)}</span>
              <span className="gg-picked-chip">{optionLabel(t, 'light', lightKey)}</span>
            </div>
            <button type="button" className="gg-restart-btn" onClick={reset}>
              {t('growGuide.startOver')}
            </button>
          </div>

          <h3 id="gg-results-heading" className="gg-q-heading">
            {methods.length === 1
              ? t('growGuide.resultHeadingOne')
              : t('growGuide.resultHeadingMany', { count: methods.length })}
          </h3>

          {note && <p className="gg-note">{note}</p>}

          <ul className="gg-method-list">
            {methods.map((method, index) => {
              const expanded = expandedMethodId === method.id
              const isBest = index === 0
              return (
                <li
                  key={method.id}
                  className={`gg-method-card${isBest ? ' best' : ''}${method.featured ? ' featured' : ''}`}
                >
                  <button
                    type="button"
                    className="gg-method-summary"
                    aria-expanded={expanded}
                    aria-controls={`gg-method-${method.id}`}
                    onClick={() => toggleMethod(method.id)}
                  >
                    <span className="gg-method-summary-text">
                      <span className="gg-method-badges">
                        {isBest && (
                          <span className="gg-badge gg-badge-best">
                            {t('growGuide.badge.best')}
                          </span>
                        )}
                        {method.featured && (
                          <span className="gg-badge gg-badge-featured">
                            {t('growGuide.badge.ourProject')}
                          </span>
                        )}
                      </span>
                      <span className="gg-method-name">{method.name}</span>
                      <span className="gg-method-tag">{method.tag}</span>
                      <span className="gg-method-blurb">{method.blurb}</span>
                      {learnMode && (
                        <span className="gg-method-science">
                          <span className="gg-science-badge" aria-hidden="true">💡</span>
                          <span>{t(`growGuide.science.${method.id}`)}</span>
                        </span>
                      )}
                    </span>
                    <span className="gg-method-chevron" aria-hidden="true">
                      {expanded ? '−' : '+'}
                    </span>
                  </button>

                  <ul className="gg-method-meta">
                    <li>
                      <span className="gg-meta-label">{t('growGuide.meta.cost')}</span>
                      <span className="gg-meta-value">{method.cost}</span>
                    </li>
                    <li>
                      <span className="gg-meta-label">{t('growGuide.meta.effort')}</span>
                      <span className="gg-meta-value">{method.effort}</span>
                    </li>
                    <li>
                      <span className="gg-meta-label">{t('growGuide.meta.firstHarvest')}</span>
                      <span className="gg-meta-value">{method.timeToHarvest}</span>
                    </li>
                  </ul>

                  {expanded && (
                    <div id={`gg-method-${method.id}`} className="gg-method-details">
                      <h4 className="gg-details-heading">{t('growGuide.details.whatYouNeed')}</h4>
                      <ul className="gg-need-list">
                        {method.needs.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>

                      <h4 className="gg-details-heading">{t('growGuide.details.setItUp')}</h4>
                      <ol className="gg-step-list">
                        {method.steps.map((stepText, idx) => (
                          <li key={idx}>{stepText}</li>
                        ))}
                      </ol>

                      <h4 className="gg-details-heading">{t('growGuide.details.goodFirstCrops')}</h4>
                      <ul className="gg-crop-chips">
                        {method.crops.map((cropId) => (
                          <li key={cropId} className="gg-crop-chip">
                            <span>{cropName(cropId, lang)}</span>
                            {onStartTracking && (
                              <button
                                type="button"
                                className="gg-crop-track-btn"
                                onClick={() => onStartTracking(cropId)}
                              >
                                {t('growGuide.startTrackingChip')}
                              </button>
                            )}
                          </li>
                        ))}
                        {method.extraCrops.map((label) => (
                          <li key={label} className="gg-crop-chip gg-crop-chip-plain">
                            <span>{label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <aside className="gg-levo-card" aria-labelledby="gg-levo-heading">
            <p className="gg-levo-eyebrow">{t('growGuide.levo.eyebrow')}</p>
            <h3 id="gg-levo-heading" className="gg-levo-title">
              {t('growGuide.levo.title')}
            </h3>
            <p className="gg-levo-body">{t('growGuide.levo.body')}</p>
            <a
              className="gg-levo-cta"
              href="https://www.levointernational.org/careers"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('growGuide.levo.cta')}
            </a>
          </aside>
        </section>
      )}
    </div>
  )
}

GrowGuide.METHODS = METHODS

export default GrowGuide
