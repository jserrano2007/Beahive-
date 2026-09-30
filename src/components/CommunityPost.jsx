import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { sortAnswers } from '../utils/community'
import ReportSummaryCard from './ReportSummaryCard'
import { AuthorLine, JoinGate, PostTags, ReportButton, VoteControl } from './CommunityParts'

function CommunityPost({
  post,
  myAuthorId,
  canParticipate,
  backLabel,
  onBack,
  onGoToGarden,
  onAnswer,
  onVote,
  onAccept,
  onReport,
}) {
  const { t, tCount } = useI18n()
  const [answerDraft, setAnswerDraft] = useState('')
  const [error, setError] = useState(null)
  const answers = sortAnswers(post)
  const isAsker = Boolean(myAuthorId) && post.authorId === myAuthorId

  function handleAnswer(event) {
    event.preventDefault()
    const body = answerDraft.trim()
    if (!body) return
    if (onAnswer(post.id, body) === false) {
      setError(t('community.saveError'))
      return
    }
    setError(null)
    setAnswerDraft('')
  }

  return (
    <div className="community-detail">
      <button type="button" className="community-back-btn" onClick={onBack}>
        {backLabel}
      </button>

      <article className="community-card community-post">
        <PostTags post={post} />
        <h2>{post.title}</h2>
        <AuthorLine item={post} myAuthorId={myAuthorId} />
        {post.body && <p className="community-body">{post.body}</p>}
        {post.photo && <img className="community-photo" src={post.photo} alt={t('community.photoAlt')} />}
        {post.report && <ReportSummaryCard summary={post.report} />}
        <div className="community-item-actions">
          <VoteControl item={post} myAuthorId={myAuthorId} onVote={(value) => onVote(post.id, null, value)} />
          <ReportButton item={post} myAuthorId={myAuthorId} onReport={() => onReport(post.id, null)} />
        </div>
      </article>

      <h3 className="community-answers-heading">{tCount('community.answersHeading', answers.length)}</h3>
      {isAsker && answers.length > 0 && !post.acceptedAnswerId && (
        <p className="text-note">{t('community.acceptHint')}</p>
      )}

      {answers.length === 0 ? (
        <p className="text-note">{t('community.noAnswers')}</p>
      ) : (
        <ul className="community-answers">
          {answers.map((answer) => {
            const accepted = answer.id === post.acceptedAnswerId
            return (
              <li key={answer.id} className={`community-card community-answer${accepted ? ' accepted' : ''}`}>
                {accepted && <span className="status-chip open">✓ {t('community.accepted')}</span>}
                <p className="community-body">{answer.body}</p>
                <AuthorLine item={answer} myAuthorId={myAuthorId} />
                <div className="community-item-actions">
                  <VoteControl
                    item={answer}
                    myAuthorId={myAuthorId}
                    onVote={(value) => onVote(post.id, answer.id, value)}
                  />
                  {isAsker && (
                    <button
                      type="button"
                      className={accepted ? 'garden-confirm-no' : 'garden-sell-btn'}
                      aria-pressed={accepted}
                      onClick={() => onAccept(post.id, answer.id)}
                    >
                      {accepted ? `✓ ${t('community.accepted')}` : t('community.accept')}
                    </button>
                  )}
                  <ReportButton
                    item={answer}
                    myAuthorId={myAuthorId}
                    onReport={() => onReport(post.id, answer.id)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {canParticipate ? (
        <form className="community-answer-form" onSubmit={handleAnswer}>
          <label className="field">
            <span>{t('community.yourAnswer')}</span>
            <textarea
              rows={3}
              value={answerDraft}
              placeholder={t('community.answerPlaceholder')}
              onChange={(event) => setAnswerDraft(event.target.value)}
            />
          </label>
          {error && <p className="garden-log-error">{error}</p>}
          <button type="submit" className="garden-limit-upgrade" disabled={!answerDraft.trim()}>
            {t('community.postAnswer')}
          </button>
        </form>
      ) : (
        <JoinGate onGoToGarden={onGoToGarden} />
      )}
    </div>
  )
}

export default CommunityPost
