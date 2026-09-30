import { useEffect, useRef, useState } from 'react'
import { cropName } from '../utils/crops'
import { formatListingPrice } from '../utils/listings'
import { formatShortDate } from '../utils/dates'
import { categoryColor } from '../utils/categories'
import { useI18n } from '../i18n/useI18n'
import './MessagesPanel.css'

const DEMO_REPLY_KEYS = [
  'messaging.demoReply1',
  'messaging.demoReply2',
  'messaging.demoReply3',
  'messaging.demoReply4',
]
const REPLY_DELAY_MS = 2000

function snapshotLabel(snapshot, lang, t) {
  const crop = snapshot.cropName || cropName(snapshot.cropId, lang)
  const priceText = formatListingPrice(snapshot, lang)
  const availability =
    snapshot.sellerType === 'business' && snapshot.availableUntil
      ? t('detail.availableUntil', { date: formatShortDate(snapshot.availableUntil, lang) })
      : null
  return { crop, priceText, availability }
}

function StarPicker({ value, onChange }) {
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-picker-btn${n <= value ? ' filled' : ''}`}
          onClick={() => onChange(n)}
          aria-label={String(n)}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

function ConversationRow({ conversation, t, lang, onOpen }) {
  const { crop, priceText } = snapshotLabel(conversation.listingSnapshot, lang, t)
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  const roleLabel =
    conversation.role === 'buying' ? t('messaging.roleBuying') : t('messaging.roleSelling')

  return (
    <li className="conversation-row" onClick={() => onOpen(conversation.id)} role="button" tabIndex={0}>
      <div className="conversation-thumb">
        {conversation.listingSnapshot.photo ? (
          <img src={conversation.listingSnapshot.photo} alt="" />
        ) : (
          <div
            className="conversation-thumb-placeholder"
            style={{ background: categoryColor(conversation.listingSnapshot.sellerType === 'business' ? 'business' : 'home_grower') }}
          >
            {crop}
          </div>
        )}
      </div>
      <div className="conversation-info">
        <div className="conversation-top">
          <span className="conversation-name">{conversation.otherPartyName}</span>
          <span className={`conversation-role-badge ${conversation.role}`}>{roleLabel}</span>
        </div>
        <div className="conversation-last-message">
          {lastMessage ? lastMessage.text : `${crop} · ${priceText}`}
        </div>
      </div>
      <div className="conversation-meta">
        {conversation.unreadCount > 0 && (
          <span className="unread-dot">{conversation.unreadCount}</span>
        )}
        {lastMessage && <span className="conversation-time">{lastMessage.time}</span>}
      </div>
    </li>
  )
}

function MessagesPanel({
  conversations = [],
  openConversationId,
  onConsumeOpenConversation,
  onSendMessage,
  onSimulateReply,
  onMarkRead,
  onRateSeller,
}) {
  const { t, lang } = useI18n()
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(() => openConversationId || null)
  const [typingId, setTypingId] = useState(null)
  const [draft, setDraft] = useState('')
  const [ratingStars, setRatingStars] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [lastOpenConversationId, setLastOpenConversationId] = useState(openConversationId)
  const typingTimerRef = useRef(null)

  if (openConversationId !== lastOpenConversationId) {
    setLastOpenConversationId(openConversationId)
    if (openConversationId) {
      setSelectedId(openConversationId)
    }
  }

  useEffect(() => {
    if (openConversationId) {
      onMarkRead(openConversationId)
      onConsumeOpenConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openConversationId])

  useEffect(() => () => clearTimeout(typingTimerRef.current), [])

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null

  function openConversation(id) {
    setSelectedId(id)
    setRatingStars(0)
    setRatingComment('')
    onMarkRead(id)
  }

  function triggerSimulatedReply(conversationId) {
    setTypingId(conversationId)
    typingTimerRef.current = setTimeout(() => {
      const key = DEMO_REPLY_KEYS[Math.floor(Math.random() * DEMO_REPLY_KEYS.length)]
      onSimulateReply(conversationId, t(key))
      setTypingId(null)
    }, REPLY_DELAY_MS)
  }

  function handleSubmitMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !selectedConversation) return
    onSendMessage(selectedConversation.id, text)
    setDraft('')
    if (selectedConversation.role === 'buying' && selectedConversation.listingSnapshot.demo) {
      triggerSimulatedReply(selectedConversation.id)
    }
  }

  function handleSubmitRating(event) {
    event.preventDefault()
    if (!selectedConversation || ratingStars === 0) return
    onRateSeller(selectedConversation.id, ratingStars, ratingComment.trim())
  }

  if (selectedConversation) {
    const { crop, priceText, availability } = snapshotLabel(
      selectedConversation.listingSnapshot,
      lang,
      t,
    )
    const isDemo = selectedConversation.listingSnapshot.demo
    const isBuying = selectedConversation.role === 'buying'
    const hasExchange =
      selectedConversation.messages.some((m) => m.sender === 'me') &&
      selectedConversation.messages.some((m) => m.sender === 'them')
    const isTyping = typingId === selectedConversation.id

    return (
      <div className="messages-panel chat-view">
        <button type="button" className="chat-back-btn" onClick={() => setSelectedId(null)}>
          {t('common.back')}
        </button>

        <div className="chat-listing-summary">
          {selectedConversation.listingSnapshot.photo ? (
            <img
              className="chat-summary-photo"
              src={selectedConversation.listingSnapshot.photo}
              alt=""
            />
          ) : (
            <div
              className="chat-summary-photo chat-summary-placeholder"
              style={{
                background: categoryColor(
                  selectedConversation.listingSnapshot.sellerType === 'business'
                    ? 'business'
                    : 'home_grower',
                ),
              }}
            >
              {crop}
            </div>
          )}
          <div className="chat-summary-text">
            <span className="chat-summary-name">{selectedConversation.otherPartyName}</span>
            <span className="chat-summary-crop">
              {crop} · {priceText}
            </span>
            {availability && <span className="chat-summary-availability">{availability}</span>}
          </div>
        </div>

        <ul className="chat-messages">
          {selectedConversation.messages.map((message) => (
            <li key={message.id} className={`chat-bubble ${message.sender}`}>
              <span className="chat-bubble-text">{message.text}</span>
              <span className="chat-bubble-time">{message.time}</span>
            </li>
          ))}
          {isTyping && (
            <li className="chat-bubble them typing">
              <span className="chat-bubble-text">{t('messaging.typing')}</span>
            </li>
          )}
        </ul>

        {selectedConversation.messages.length === 0 && (
          <p className="messaging-empty-hint">{t('messaging.noMessagesYet')}</p>
        )}

        {isBuying && isDemo && (
          <button
            type="button"
            className="demo-reply-btn"
            onClick={() => triggerSimulatedReply(selectedConversation.id)}
          >
            {t('messaging.replyAsSellerBtn')}
          </button>
        )}

        {isBuying && hasExchange && !selectedConversation.rating && (
          <form className="rate-seller-form" onSubmit={handleSubmitRating}>
            <span className="rate-seller-prompt">
              {t('messaging.ratePrompt', { seller: selectedConversation.otherPartyName })}
            </span>
            <StarPicker value={ratingStars} onChange={setRatingStars} />
            <input
              type="text"
              className="rate-seller-comment"
              placeholder={t('messaging.rateCommentPlaceholder')}
              value={ratingComment}
              onChange={(event) => setRatingComment(event.target.value)}
            />
            <button type="submit" className="rate-seller-submit" disabled={ratingStars === 0}>
              {t('messaging.submitRating')}
            </button>
          </form>
        )}

        {isBuying && selectedConversation.rating && (
          <p className="rate-seller-done">
            {t('messaging.ratingSaved', { seller: selectedConversation.otherPartyName })}
          </p>
        )}

        <form className="chat-input-row" onSubmit={handleSubmitMessage}>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('messaging.inputPlaceholder')}
          />
          <button type="submit" className="chat-send-btn">
            {t('messaging.send')}
          </button>
        </form>
      </div>
    )
  }

  const filtered = conversations
    .filter((c) => filter === 'all' || c.role === filter)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="messages-panel">
      <div className="messaging-filters">
        {['all', 'buying', 'selling'].map((key) => (
          <button
            key={key}
            type="button"
            className={`messaging-filter-btn${filter === key ? ' active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {t(`messaging.filter${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="messaging-empty">
          <p>{t('messaging.emptyInboxTitle')}</p>
          <p>{t('messaging.emptyInboxBody')}</p>
        </div>
      ) : (
        <ul className="conversation-list">
          {filtered.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              t={t}
              lang={lang}
              onOpen={openConversation}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default MessagesPanel
