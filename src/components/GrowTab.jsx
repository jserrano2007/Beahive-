import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { draftForPlanting } from '../utils/community'
import GrowGuide from './GrowGuide'
import CommunitySection from './CommunitySection'
import HarvestReports from './HarvestReports'
import './Community.css'

const SECTIONS = ['guides', 'community', 'reports']

function GrowTab({
  plantings,
  account,
  learnMode = false,
  onToggleLearnMode,
  posts,
  sharedReports,
  communityDraftPlantingId,
  onConsumeCommunityDraft,
  onStartTracking,
  onGoToGarden,
  onCreatePost,
  onAnswer,
  onVote,
  onAccept,
  onReport,
}) {
  const { t } = useI18n()
  const [initialDraft] = useState(() => {
    const planting = plantings.find((p) => p.id === communityDraftPlantingId)
    return planting ? draftForPlanting(planting) : null
  })
  const [section, setSection] = useState(initialDraft ? 'community' : 'guides')

  useEffect(() => {
    if (communityDraftPlantingId) onConsumeCommunityDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grow-tab">
      <div className="grow-learn-row">
        <button
          type="button"
          className={`learn-toggle-btn${learnMode ? ' active' : ''}`}
          onClick={onToggleLearnMode}
          aria-pressed={learnMode}
          aria-label={t('learn.toggleAria')}
          title={t('learn.toggleAria')}
        >
          <span aria-hidden="true">💡</span>
          <span>{t('learn.toggle')}</span>
        </button>
      </div>
      {learnMode && (
        <p className="grow-learn-banner" role="status">
          <span aria-hidden="true">💡</span> {t('learn.banner')}
        </p>
      )}

      <div className="grow-segmented" role="tablist" aria-label={t('tabs.grow')}>
        {SECTIONS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`grow-section-${key}`}
            aria-selected={section === key}
            aria-controls="grow-section-panel"
            className={`grow-segment${section === key ? ' active' : ''}`}
            onClick={() => setSection(key)}
          >
            {t(`grow.section.${key}`)}
          </button>
        ))}
      </div>

      <div id="grow-section-panel" role="tabpanel" aria-labelledby={`grow-section-${section}`}>
        {section === 'guides' && (
          <GrowGuide learnMode={learnMode} onStartTracking={onStartTracking} />
        )}
        {section === 'community' && (
          <CommunitySection
            posts={posts}
            plantings={plantings}
            account={account}
            initialDraft={initialDraft}
            onGoToGarden={onGoToGarden}
            onCreatePost={onCreatePost}
            onAnswer={onAnswer}
            onVote={onVote}
            onAccept={onAccept}
            onReport={onReport}
          />
        )}
        {section === 'reports' && <HarvestReports sharedReports={sharedReports} account={account} />}
      </div>
    </div>
  )
}

export default GrowTab
