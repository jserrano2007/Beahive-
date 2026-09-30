import { useEffect, useState } from 'react'
import SellForm from './SellForm'
import MessagesPanel from './MessagesPanel'
import MyBusinessPanel from './MyBusinessPanel'
import { useI18n } from '../i18n/useI18n'
import './SellTab.css'

function SellTab({
  account = {},
  listings,
  now,
  prefill,
  sources,
  onSaveListing,
  onUpdateListing,
  onRemoveListing,
  onListForSale,
  onConsumePrefill,
  onUpdateAccount,
  onGoToGarden,
  onViewInFindFood,
  onOpenSettings,
  onViewOnMap,
  sellSubTabRequest,
  onConsumeSellSubTabRequest,
  conversations = [],
  openConversationId,
  onConsumeOpenConversation,
  onSendMessage,
  onSimulateReply,
  onMarkRead,
  onRateSeller,
  businessStops = [],
  onSaveBusinessStop,
  onRemoveBusinessStop,
}) {
  const { t } = useI18n()
  const isNeighbor = account.type !== 'business'
  const [subTab, setSubTab] = useState(() => sellSubTabRequest || 'listings')

  useEffect(() => {
    if (sellSubTabRequest) onConsumeSellSubTabRequest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  return (
    <div className="sell-tab-wrapper">
      {isNeighbor && (
        <div className="sell-subtabs">
          <button
            type="button"
            className={`sell-subtab-btn${subTab === 'listings' ? ' active' : ''}`}
            onClick={() => setSubTab('listings')}
          >
            {t('sell.subtabs.listings')}
          </button>
          <button
            type="button"
            className={`sell-subtab-btn${subTab === 'messages' ? ' active' : ''}`}
            onClick={() => setSubTab('messages')}
          >
            {t('sell.subtabs.messages')}
            {unreadCount > 0 && <span className="sell-subtab-badge">{unreadCount}</span>}
          </button>
        </div>
      )}

      {!isNeighbor && (
        <>
          <div className="sell-subtabs">
            <button
              type="button"
              className={`sell-subtab-btn${subTab === 'listings' ? ' active' : ''}`}
              onClick={() => setSubTab('listings')}
            >
              {t('sell.subtabs.listings')}
            </button>
            <button
              type="button"
              className={`sell-subtab-btn${subTab === 'business' ? ' active' : ''}`}
              onClick={() => setSubTab('business')}
            >
              {t('sell.subtabs.myBusiness')}
            </button>
          </div>
          {subTab === 'listings' && (
            <button
              type="button"
              className="view-on-map-top-btn"
              onClick={() => onViewOnMap(null)}
            >
              {t('myMap.viewOnMap')}
            </button>
          )}
        </>
      )}

      {(isNeighbor ? subTab === 'listings' : subTab === 'listings') && (
        <SellForm
          listings={listings}
          now={now}
          prefill={prefill}
          account={account}
          sources={sources}
          onSaveListing={onSaveListing}
          onUpdateListing={onUpdateListing}
          onRemoveListing={onRemoveListing}
          onListForSale={onListForSale}
          onConsumePrefill={onConsumePrefill}
          onUpdateAccount={onUpdateAccount}
          onGoToGarden={onGoToGarden}
          onViewInFindFood={onViewInFindFood}
          onOpenSettings={onOpenSettings}
          onViewOnMap={!isNeighbor ? onViewOnMap : undefined}
        />
      )}

      {isNeighbor && subTab === 'messages' && (
        <MessagesPanel
          conversations={conversations}
          openConversationId={openConversationId}
          onConsumeOpenConversation={onConsumeOpenConversation}
          onSendMessage={onSendMessage}
          onSimulateReply={onSimulateReply}
          onMarkRead={onMarkRead}
          onRateSeller={onRateSeller}
        />
      )}

      {!isNeighbor && subTab === 'business' && (
        <MyBusinessPanel
          account={account}
          stops={businessStops}
          onSaveStop={onSaveBusinessStop}
          onRemoveStop={onRemoveBusinessStop}
        />
      )}
    </div>
  )
}

export default SellTab
