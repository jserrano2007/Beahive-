import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { BUZZ_SYSTEM_PROMPT } from '../ai/buzzSystemPrompt'
import { buildBuzzContext } from '../ai/buzzContext'
import './ChatFab.css'

function toAnthropicMessages(messages) {
  return messages.map((m) => ({ role: m.role, content: m.text }))
}

function ChatFab({
  places = [],
  listings = [],
  plantings = [],
  devices = [],
  account = {},
  now = new Date(),
}) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const fabRef = useRef(null)

  const systemPrompt = useMemo(() => {
    const langHint =
      lang === 'es'
        ? '\n\nThe app is currently set to Spanish. Prefer answering in Spanish unless the person writes in English.'
        : '\n\nThe app is currently set to English. Prefer answering in English unless the person writes in Spanish.'
    return `${BUZZ_SYSTEM_PROMPT}${langHint}`
  }, [lang])

  const closeSheet = useCallback(() => {
    setOpen(false)
    setError(null)
    // Return focus to FAB for keyboard users.
    window.requestAnimationFrame(() => fabRef.current?.focus())
  }, [])

  // Focus input, listen for Escape, lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus())
    function onKey(event) {
      if (event.key === 'Escape') closeSheet()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, closeSheet])

  // Auto-scroll to newest message.
  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending, open])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    const nextMessages = [...messages, { role: 'user', text: trimmed }]
    setMessages(nextMessages)
    setDraft('')
    setSending(true)
    setError(null)
    try {
      const context = buildBuzzContext({
        places,
        listings,
        plantings,
        devices,
        account,
        now: now instanceof Date ? now : new Date(),
        lang,
      })
      const systemWithContext = `${systemPrompt}\n\nAPP CONTEXT (JSON — read this before answering; do not repeat it back to the user):\n${JSON.stringify(context)}`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: toAnthropicMessages(nextMessages),
          system: systemWithContext,
        }),
      })
      const raw = await response.text()
      let data = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        // Non-JSON response (e.g. HTML 404 when /api/chat isn't deployed).
        data = { error: raw.slice(0, 160) || `HTTP ${response.status}` }
      }
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }
      const reply = (data.text || '').trim()
      if (!reply) throw new Error('empty')
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      if (err.message === 'empty') {
        setError(t('chat.errorEmpty'))
      } else {
        // Surface the real cause so it's debuggable (missing key, 404, quota, etc.).
        setError(`${t('chat.errorGeneric')} — ${err.message}`)
      }
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(draft)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage(draft)
    }
  }

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="chat-fab"
        aria-label={t('chat.openAria')}
        aria-expanded={open}
        aria-controls="chat-sheet"
        onClick={() => setOpen(true)}
      >
        <svg
          className="chat-fab-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
          <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
        </svg>
        <span className="chat-fab-label">{t('chat.openLabel')}</span>
      </button>

      {open && (
        <div
          className="chat-backdrop"
          onClick={closeSheet}
          role="presentation"
        />
      )}

      <div
        id="chat-sheet"
        className={`chat-sheet${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-sheet-title"
        aria-hidden={!open}
      >
        <header className="chat-sheet-header">
          <div className="chat-sheet-title-block">
            <span className="chat-sheet-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
                <path d="M12 16c0-3 1.5-5.5 4-6.5-.5 3-2 5-4 6.5Z" />
                <path d="M12 16c0-3-1.5-5.5-4-6.5 .5 3 2 5 4 6.5Z" />
              </svg>
            </span>
            <div>
              <h2 id="chat-sheet-title" className="chat-sheet-title">
                {t('chat.title')}
              </h2>
              <p className="chat-sheet-subtitle">{t('chat.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            className="chat-sheet-close"
            onClick={closeSheet}
            aria-label={t('chat.close')}
          >
            ×
          </button>
        </header>

        <div className="chat-sheet-body" ref={listRef}>
          {messages.length === 0 && (
            <div className="chat-empty">
              <p className="chat-empty-title">{t('chat.emptyTitle')}</p>
              <p className="chat-empty-body">{t('chat.emptyBody')}</p>
            </div>
          )}
          <ul className="chat-messages" aria-live="polite" aria-relevant="additions">
            {messages.map((msg, idx) => (
              <li key={idx} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.text}
              </li>
            ))}
            {sending && (
              <li className="chat-msg chat-msg-assistant chat-msg-typing" aria-label={t('chat.thinking')}>
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
              </li>
            )}
          </ul>
          {error && (
            <p className="chat-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <label className="chat-input-label" htmlFor="chat-input">
            {t('chat.inputLabel')}
          </label>
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-input"
            rows={1}
            placeholder={t('chat.placeholder')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={sending || !draft.trim()}
            aria-label={t('chat.send')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12l16-8-6 16-2-6-8-2z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}

export default ChatFab
