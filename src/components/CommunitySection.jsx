import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { cropName } from '../utils/crops'
import { GROWING_METHODS, growingMethodLabel } from '../utils/plantings'
import {
  COMMUNITY_CROP_IDS,
  EMPTY_DRAFT,
  SORTS,
  TOPICS,
  isAnswered,
  isHidden,
  itemScore,
  matchesSearch,
  sortPosts,
  visibleAnswers,
} from '../utils/community'
import PostComposer from './PostComposer'
import CommunityPost from './CommunityPost'
import { AuthorLine, JoinGate, PostTags } from './CommunityParts'
import './Community.css'

function scrollToTop() {
  window.scrollTo({ top: 0 })
}

function PostCard({ post, myAuthorId, onOpen }) {
  const { t, tCount } = useI18n()
  const answered = isAnswered(post)
  return (
    <li>
      <button type="button" className="community-card community-feed-item" onClick={onOpen}>
        <span className="community-feed-score" aria-label={t('community.score', { score: itemScore(post) })}>
          <span aria-hidden="true">▲</span>
          {itemScore(post)}
        </span>
        <span className="community-feed-main">
          <span className="community-feed-title">{post.title}</span>
          <AuthorLine item={post} myAuthorId={myAuthorId} />
          <PostTags post={post} />
          <span className="community-feed-meta">
            {answered && <span className="status-chip open">✓ {t('community.answered')}</span>}
            <span className="text-note">{tCount('community.answer', visibleAnswers(post).length)}</span>
            {post.report && <span className="text-note">📊 {t('community.hasReport')}</span>}
          </span>
        </span>
      </button>
    </li>
  )
}

function CommunitySection({
  posts,
  plantings,
  account,
  initialDraft,
  onGoToGarden,
  onCreatePost,
  onAnswer,
  onVote,
  onAccept,
  onReport,
}) {
  const { t, lang } = useI18n()
  const [view, setView] = useState(() => (initialDraft ? { type: 'compose' } : { type: 'feed' }))
  const [draft, setDraft] = useState(() => initialDraft ?? EMPTY_DRAFT)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('top')
  const [filters, setFilters] = useState({ cropId: '', method: '', topic: '' })

  const myAuthorId = account.authorId ?? null
  const canParticipate = plantings.length > 0
  const visiblePosts = posts.filter((post) => !isHidden(post))

  function go(nextView) {
    setView(nextView)
    scrollToTop()
  }

  function handleSubmit(nextDraft) {
    const post = onCreatePost(nextDraft)
    if (!post) return false
    setDraft(EMPTY_DRAFT)
    go({ type: 'post', id: post.id, from: 'feed' })
    return true
  }

  if (view.type === 'compose' && canParticipate) {
    return (
      <PostComposer
        draft={draft}
        onChangeDraft={setDraft}
        posts={visiblePosts}
        plantings={plantings}
        onSubmit={handleSubmit}
        onCancel={() => {
          setDraft(EMPTY_DRAFT)
          go({ type: 'feed' })
        }}
        onOpenPost={(id) => go({ type: 'post', id, from: 'compose' })}
      />
    )
  }

  const openPost = view.type === 'post' ? visiblePosts.find((post) => post.id === view.id) : null
  if (openPost) {
    const backToDraft = view.from === 'compose'
    return (
      <CommunityPost
        post={openPost}
        myAuthorId={myAuthorId}
        canParticipate={canParticipate}
        backLabel={backToDraft ? t('community.backToDraft') : t('community.backToFeed')}
        onBack={() => go({ type: backToDraft ? 'compose' : 'feed' })}
        onGoToGarden={onGoToGarden}
        onAnswer={onAnswer}
        onVote={onVote}
        onAccept={onAccept}
        onReport={onReport}
      />
    )
  }

  const results = sortPosts(
    visiblePosts.filter(
      (post) =>
        (!filters.cropId || post.cropId === filters.cropId) &&
        (!filters.method || post.method === filters.method) &&
        (!filters.topic || post.topic === filters.topic) &&
        matchesSearch(post, query, post.cropId ? cropName(post.cropId, lang) : ''),
    ),
    sort,
  )

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="community-feed">
      <input
        type="search"
        className="community-search"
        value={query}
        placeholder={t('community.searchPlaceholder')}
        aria-label={t('community.searchPlaceholder')}
        onChange={(event) => setQuery(event.target.value)}
      />

      {canParticipate ? (
        <button
          type="button"
          className="grow-track-btn community-ask-btn"
          onClick={() => {
            // Carry the search over so similar posts show right away.
            if (!draft.title && query.trim()) setDraft({ ...draft, title: query.trim() })
            go({ type: 'compose' })
          }}
        >
          {t('community.ask')}
        </button>
      ) : (
        <JoinGate onGoToGarden={onGoToGarden} />
      )}

      <div className="chip-row" role="group" aria-label={t('community.sortLabel')}>
        {SORTS.map((key) => (
          <button
            key={key}
            type="button"
            className={`chip${sort === key ? ' active' : ''}`}
            aria-pressed={sort === key}
            onClick={() => setSort(key)}
          >
            {t(`community.sort.${key}`)}
          </button>
        ))}
      </div>

      <div className="community-filters">
        <select
          aria-label={t('community.filter.crop')}
          value={filters.cropId}
          onChange={(event) => setFilter('cropId', event.target.value)}
        >
          <option value="">{t('community.filter.allCrops')}</option>
          {COMMUNITY_CROP_IDS.map((id) => (
            <option key={id} value={id}>
              {cropName(id, lang)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('community.filter.method')}
          value={filters.method}
          onChange={(event) => setFilter('method', event.target.value)}
        >
          <option value="">{t('community.filter.allMethods')}</option>
          {GROWING_METHODS.map((method) => (
            <option key={method} value={method}>
              {growingMethodLabel(method, lang)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('community.filter.topic')}
          value={filters.topic}
          onChange={(event) => setFilter('topic', event.target.value)}
        >
          <option value="">{t('community.filter.allTopics')}</option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {t(`community.topic.${topic}`)}
            </option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <p className="community-empty">{t('community.noResults')}</p>
      ) : (
        <ul className="community-list">
          {results.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myAuthorId={myAuthorId}
              onOpen={() => go({ type: 'post', id: post.id, from: 'feed' })}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default CommunitySection
