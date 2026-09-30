import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { cropName } from '../utils/crops'
import { formatShortDate } from '../utils/dates'
import { GROWING_METHODS, growingMethodLabel } from '../utils/plantings'
import { COMMUNITY_CROP_IDS, TOPICS, findSimilarPosts, isAnswered, visibleAnswers } from '../utils/community'
import { resizeImageToDataUrl } from '../utils/image'
import { getReportAttachment } from '../data/store'
import ReportSummaryCard from './ReportSummaryCard'

function PostComposer({ draft, onChangeDraft, posts, plantings, onSubmit, onCancel, onOpenPost }) {
  const { t, lang, tCount } = useI18n()
  const [error, setError] = useState(null)

  const similar = useMemo(
    () => findSimilarPosts(posts, { title: draft.title, cropId: draft.cropId }),
    [posts, draft.title, draft.cropId],
  )
  const attachment = useMemo(
    () => (draft.plantingId ? getReportAttachment(draft.plantingId) : null),
    [draft.plantingId],
  )

  function update(key, value) {
    onChangeDraft({ ...draft, [key]: value })
  }

  function handlePlantingChange(plantingId) {
    const planting = plantings.find((p) => p.id === plantingId)
    onChangeDraft({
      ...draft,
      plantingId,
      cropId: draft.cropId || planting?.cropId || '',
      method: draft.method || planting?.method || '',
    })
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    try {
      update('photo', await resizeImageToDataUrl(file))
    } catch {
      setError(t('sell.photoError'))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const title = draft.title.trim()
    if (!title) return
    const saved = onSubmit({ ...draft, title, body: draft.body.trim() })
    if (saved === false) setError(t('community.saveError'))
  }

  return (
    <form className="community-composer" onSubmit={handleSubmit}>
      <h2>{t('community.compose.heading')}</h2>

      <label className="field">
        <span>{t('community.compose.title')}</span>
        <input
          type="text"
          value={draft.title}
          maxLength={140}
          placeholder={t('community.compose.titlePlaceholder')}
          onChange={(event) => update('title', event.target.value)}
          required
        />
      </label>

      {similar.length > 0 && (
        <div className="community-similar" aria-live="polite">
          <span className="text-label">{t('community.compose.similarHeading')}</span>
          <ul>
            {similar.map((post) => (
              <li key={post.id}>
                <button type="button" onClick={() => onOpenPost(post.id)}>
                  <span className="community-similar-title">{post.title}</span>
                  <span className="text-note">
                    {isAnswered(post) && `✓ ${t('community.answered')} · `}
                    {tCount('community.answer', visibleAnswers(post).length)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="field">
        <span>{t('community.compose.body')}</span>
        <textarea
          rows={4}
          value={draft.body}
          placeholder={t('community.compose.bodyPlaceholder')}
          onChange={(event) => update('body', event.target.value)}
        />
      </label>

      <div className="community-composer-row">
        <label className="field">
          <span>{t('community.compose.topic')}</span>
          <select value={draft.topic} onChange={(event) => update('topic', event.target.value)}>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {t(`community.topic.${topic}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t('community.compose.crop')}</span>
          <select value={draft.cropId} onChange={(event) => update('cropId', event.target.value)}>
            <option value="">{t('community.compose.noCrop')}</option>
            {COMMUNITY_CROP_IDS.map((id) => (
              <option key={id} value={id}>
                {cropName(id, lang)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>{t('community.compose.method')}</span>
        <select value={draft.method} onChange={(event) => update('method', event.target.value)}>
          <option value="">{t('community.compose.noMethod')}</option>
          {GROWING_METHODS.map((method) => (
            <option key={method} value={method}>
              {growingMethodLabel(method, lang)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t('community.compose.attachReport')}</span>
        <select value={draft.plantingId} onChange={(event) => handlePlantingChange(event.target.value)}>
          <option value="">{t('community.compose.noReport')}</option>
          {plantings.map((planting) => (
            <option key={planting.id} value={planting.id}>
              {cropName(planting.cropId, lang)} · {growingMethodLabel(planting.method, lang)} ·{' '}
              {formatShortDate(planting.datePlanted, lang)}
            </option>
          ))}
        </select>
        <span className="text-note">{t('community.compose.attachHint')}</span>
      </label>
      {attachment && <ReportSummaryCard summary={attachment} />}

      <div className="field">
        <span>{t('community.compose.photo')}</span>
        {draft.photo ? (
          <div className="garden-photo-draft">
            <img src={draft.photo} alt={t('community.photoAlt')} />
            <button type="button" className="garden-confirm-no" onClick={() => update('photo', null)}>
              {t('sell.field.removePhoto')}
            </button>
          </div>
        ) : (
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        )}
      </div>

      {error && <p className="garden-log-error">{error}</p>}

      <div className="garden-actions">
        <button type="submit" className="garden-limit-upgrade" disabled={!draft.title.trim()}>
          {t('community.compose.submit')}
        </button>
        <button type="button" className="garden-confirm-no" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

export default PostComposer
