import { useI18n } from '../i18n/useI18n'
import { cropName } from '../utils/crops'
import { formatShortDate, toDateStr } from '../utils/dates'
import { growingMethodLabel } from '../utils/plantings'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { isTrusted, itemScore } from '../utils/community'

export function AuthorLine({ item, myAuthorId }) {
  const { t, lang } = useI18n()
  const isMe = Boolean(myAuthorId) && item.authorId === myAuthorId
  const name = isMe ? t('community.you') : item.authorName || t('community.neighbor')
  const hood = NEIGHBORHOODS.find((n) => n.key === item.authorHood)?.label
  const date = formatShortDate(toDateStr(new Date(item.createdAt)), lang)

  return (
    <div className="community-author">
      <span>
        <strong>{name}</strong>
        {hood && ` · ${hood}`} · {date}
      </span>
      {isTrusted(item) && (
        <span className="community-expert-badge">
          <span aria-hidden="true">✓</span> {t('community.localExpert', { org: item.authorOrg })}
        </span>
      )}
      {item.demo && <span className="badge">{t('common.demo')}</span>}
    </div>
  )
}

export function PostTags({ post }) {
  const { t, lang } = useI18n()
  return (
    <div className="community-tags">
      <span className="community-tag topic">{t(`community.topic.${post.topic}`)}</span>
      {post.cropId && <span className="community-tag">{cropName(post.cropId, lang)}</span>}
      {post.method && <span className="community-tag">{growingMethodLabel(post.method, lang)}</span>}
    </div>
  )
}

export function VoteControl({ item, myAuthorId, onVote }) {
  const { t } = useI18n()
  const score = itemScore(item)
  const myVote = myAuthorId ? item.votes?.[myAuthorId] ?? 0 : 0

  return (
    <div className="community-votes" role="group" aria-label={t('community.score', { score })}>
      <button
        type="button"
        className={`community-vote-btn${myVote === 1 ? ' active up' : ''}`}
        aria-pressed={myVote === 1}
        aria-label={t('community.upvote')}
        onClick={() => onVote(1)}
      >
        ▲
      </button>
      <span className="community-score">{score}</span>
      <button
        type="button"
        className={`community-vote-btn${myVote === -1 ? ' active down' : ''}`}
        aria-pressed={myVote === -1}
        aria-label={t('community.downvote')}
        onClick={() => onVote(-1)}
      >
        ▼
      </button>
    </div>
  )
}

export function ReportButton({ item, myAuthorId, onReport }) {
  const { t } = useI18n()
  const reported = Boolean(myAuthorId) && (item.reportedBy ?? []).includes(myAuthorId)
  return (
    <button type="button" className="community-report-btn" disabled={reported} onClick={onReport}>
      <span aria-hidden="true">⚑</span> {reported ? t('community.reported') : t('community.report')}
    </button>
  )
}

export function JoinGate({ onGoToGarden }) {
  const { t } = useI18n()
  return (
    <div className="community-gate">
      <p className="community-gate-title">{t('community.gateTitle')}</p>
      <p className="text-note">{t('community.gateBody')}</p>
      <button type="button" className="garden-limit-upgrade" onClick={onGoToGarden}>
        {t('community.goToGarden')}
      </button>
    </div>
  )
}
