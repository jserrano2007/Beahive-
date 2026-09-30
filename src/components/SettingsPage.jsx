import { useEffect, useState } from 'react'
import { NEIGHBORHOODS } from '../utils/neighborhoods'
import { PLUS_LISTING_LIMIT, countActiveListings, getListingLimit } from '../utils/account'
import { useI18n } from '../i18n/useI18n'
import VerificationSheet from './VerificationSheet'
import './SettingsPage.css'

function SettingsPage({
  open,
  account = {},
  listings = [],
  sources = [],
  onUpdateAccount,
  onClose,
  onResetDemoData,
  onClearAllData,
}) {
  const { t, tCount } = useI18n()
  const [showVerification, setShowVerification] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) {
      setShowVerification(false)
      setConfirmReset(false)
      setConfirmClear(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const activeCount = countActiveListings(listings)
  const limit = getListingLimit(account)
  const usageText =
    limit === Infinity
      ? tCount('sell.usage_unlimited', activeCount)
      : t('sell.usage_limited', { count: activeCount, limit })

  const linkedSource = account.linkedSourceId
    ? sources.find((s) => s.id === account.linkedSourceId)
    : null

  function handleSubscribe() {
    onUpdateAccount({ subscription: 'plus' })
  }

  function handleCancelPlus() {
    onUpdateAccount({ subscription: 'free' })
  }

  function handleVerify(formValues) {
    onUpdateAccount({
      type: 'business',
      businessName: formValues.businessName,
      businessType: formValues.businessType,
      linkedSourceId: formValues.linkedSourceId,
      registrationId: formValues.registrationId,
      contactEmail: formValues.contactEmail,
      verified: true,
    })
    setShowVerification(false)
  }

  function handleDemoSwitch() {
    if (account.type === 'business') {
      onUpdateAccount({
        type: 'neighbor',
        businessName: null,
        businessType: null,
        linkedSourceId: null,
        registrationId: null,
        contactEmail: null,
        verified: false,
      })
    } else {
      onUpdateAccount({
        type: 'business',
        businessName: account.businessName || 'Demo Farm Co.',
        businessType: account.businessType || 'Farm',
        verified: true,
      })
    }
  }

  return (
    <div
      className={`settings-page${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('settings.title')}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="settings-header">
        <button type="button" className="settings-back-btn" onClick={onClose}>
          {t('common.back')}
        </button>
        <h2>{t('settings.title')}</h2>
      </div>

      <div className="settings-body">
        <section className="settings-section">
          <h3>{t('settings.account')}</h3>
          <div className="settings-row">
            <span className="settings-label">{t('settings.accountType')}</span>
            <span className="settings-value">
              {account.type === 'business' ? t('settings.business') : t('settings.neighbor')}
            </span>
          </div>
          <label className="field">
            <span>{t('sell.field.displayName')}</span>
            <input
              type="text"
              value={account.displayName || ''}
              placeholder={t('sell.field.displayNamePlaceholder')}
              onChange={(event) => onUpdateAccount({ displayName: event.target.value })}
            />
          </label>
          <label className="field">
            <span>{t('sell.field.neighborhood')}</span>
            <select
              value={account.neighborhood || ''}
              onChange={(event) => onUpdateAccount({ neighborhood: event.target.value })}
            >
              <option value="">{t('common.notSet')}</option>
              {NEIGHBORHOODS.map((neighborhood) => (
                <option key={neighborhood.key} value={neighborhood.key}>
                  {neighborhood.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {account.type === 'neighbor' && (
          <section className="settings-section">
            <h3>{t('settings.subscription')}</h3>
            <div className="settings-row">
              <span className="settings-label">{t('settings.currentPlan')}</span>
              <span className="settings-value">
                {account.subscription === 'plus' ? t('settings.neighborPlus') : t('settings.freePlan')}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">{t('settings.usage')}</span>
              <span className="settings-value">{usageText}</span>
            </div>
            <div className="plus-card">
              <h4>{t('settings.neighborPlus')}</h4>
              <p>{t('settings.plusCardBody', { limit: PLUS_LISTING_LIMIT })}</p>
              {account.subscription === 'plus' ? (
                <button type="button" className="plus-cancel-btn" onClick={handleCancelPlus}>
                  {t('settings.cancelDemo')}
                </button>
              ) : (
                <button type="button" className="plus-subscribe-btn" onClick={handleSubscribe}>
                  {t('settings.subscribeDemo')}
                </button>
              )}
            </div>
          </section>
        )}

        <section className="settings-section">
          <h3>{t('settings.businessSection')}</h3>
          {account.type === 'neighbor' ? (
            <button
              type="button"
              className="business-link"
              onClick={() => setShowVerification(true)}
            >
              {t('settings.areYouBusiness')}
            </button>
          ) : (
            <>
              <div className="settings-row">
                <span className="settings-label">{t('settings.businessName')}</span>
                <span className="settings-value">{account.businessName || t('common.notSet')}</span>
              </div>
              <div className="settings-row">
                <span className="settings-label">{t('settings.linkedPlace')}</span>
                <span className="settings-value">
                  {linkedSource ? linkedSource.name : t('common.none')}
                </span>
              </div>
              {account.verified && (
                <span className="verified-badge">{t('settings.verifiedBadge')}</span>
              )}
            </>
          )}
        </section>

        <section className="settings-section">
          <h3>{t('settings.preferences')}</h3>
          <label className="field">
            <span>{t('settings.defaultNeighborhood')}</span>
            <select
              value={account.preferredNeighborhood || ''}
              onChange={(event) =>
                onUpdateAccount({ preferredNeighborhood: event.target.value || null })
              }
            >
              <option value="">{t('settings.noPreference')}</option>
              {NEIGHBORHOODS.map((neighborhood) => (
                <option key={neighborhood.key} value={neighborhood.key}>
                  {neighborhood.label}
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span id="settings-language-label">{t('settings.language')}</span>
            <span id="settings-language-help" className="text-note settings-help">
              {t('settings.languageHelp')}
            </span>
            <div
              className="settings-segmented"
              role="group"
              aria-labelledby="settings-language-label"
              aria-describedby="settings-language-help"
            >
              {[
                { value: 'en', label: t('settings.languageEnglish') },
                { value: 'es', label: t('settings.languageSpanish') },
              ].map((option) => {
                const selected = (account.language || 'en') === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    lang={option.value}
                    className={`settings-segment${selected ? ' active' : ''}`}
                    onClick={() => {
                      if (!selected) onUpdateAccount({ language: option.value })
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>{t('settings.demoTools')}</h3>
          <button type="button" className="demo-switch-btn" onClick={handleDemoSwitch}>
            {t('settings.demoSwitchTo', {
              type: (account.type === 'business' ? t('settings.neighbor') : t('settings.business')).toLowerCase(),
            })}
          </button>

          <div className="settings-danger-zone">
            {confirmReset ? (
              <div className="settings-confirm">
                <p>{t('settings.resetDemoDataConfirm')}</p>
                <div className="settings-confirm-actions">
                  <button
                    type="button"
                    className="settings-confirm-yes"
                    onClick={() => {
                      onResetDemoData()
                      setConfirmReset(false)
                    }}
                  >
                    {t('settings.resetDemoDataYes')}
                  </button>
                  <button
                    type="button"
                    className="settings-confirm-no"
                    onClick={() => setConfirmReset(false)}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="settings-danger-btn"
                onClick={() => setConfirmReset(true)}
              >
                {t('settings.resetDemoData')}
              </button>
            )}

            {confirmClear ? (
              <div className="settings-confirm">
                <p>{t('settings.clearAllDataConfirm')}</p>
                <div className="settings-confirm-actions">
                  <button
                    type="button"
                    className="settings-confirm-yes"
                    onClick={() => {
                      onClearAllData()
                      setConfirmClear(false)
                    }}
                  >
                    {t('settings.clearAllDataYes')}
                  </button>
                  <button
                    type="button"
                    className="settings-confirm-no"
                    onClick={() => setConfirmClear(false)}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="settings-danger-btn"
                onClick={() => setConfirmClear(true)}
              >
                {t('settings.clearAllData')}
              </button>
            )}
          </div>
        </section>
      </div>

      <VerificationSheet
        open={showVerification}
        sources={sources}
        onClose={() => setShowVerification(false)}
        onSubmit={handleVerify}
      />
    </div>
  )
}

export default SettingsPage
