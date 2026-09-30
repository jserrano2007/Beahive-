import { useCallback, useEffect, useMemo, useState } from 'react'
import BeahiveLogo from './components/BeahiveLogo'
import ChatFab from './components/ChatFab'
import TabBar from './components/TabBar'
import FindFoodTab from './components/FindFoodTab'
import SellTab from './components/SellTab'
import GrowTab from './components/GrowTab'
import MyGarden from './components/MyGarden'
import SettingsPage from './components/SettingsPage'
import MessagesTab from './components/MessagesTab'
import InsightsTab from './components/InsightsTab'
import MyMapTab from './components/MyMapTab'
import { fetchPlaces } from './utils/places'
import { getNow } from './utils/hours'
import { I18nProvider } from './i18n/I18nProvider'
import { useI18n } from './i18n/useI18n'
import { getTabsForAccount, isValidTab, getFirstTab } from './config/tabs'
import {
  getListings,
  saveListing,
  updateListing,
  removeListing,
  getPlantings,
  savePlanting,
  removePlanting,
  addPlantingNote,
  addPlantingHarvest,
  finishPlanting,
  getSharedReports,
  shareReport,
  unshareReport,
  getAccount,
  updateAccount,
  resetDemoData,
  clearAllData,
  getConversations,
  findOrCreateConversation,
  appendMessage,
  markConversationRead,
  rateConversationSeller,
  getDevices,
  pairDevice,
  unpairDevice,
  getCommunityPosts,
  createCommunityPost,
  addCommunityAnswer,
  voteCommunityItem,
  acceptCommunityAnswer,
  reportCommunityItem,
} from './data/store'
import './App.css'

function AppHeader({ onOpenSettings, now }) {
  const { t } = useI18n()
  const hour = now.getHours()
  const greetingKey =
    hour < 12 ? 'app.greetingMorning' : hour < 18 ? 'app.greetingAfternoon' : 'app.greetingEvening'

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <BeahiveLogo size={28} showWordmark title="Beahive" />
      </div>
      <div className="app-header-top">
        <p className="app-greeting">
          {t('app.location')} · {t(greetingKey)}
        </p>
        <button
          type="button"
          className="settings-gear-btn"
          onClick={onOpenSettings}
          aria-label={t('settings.title')}
        >
          ⚙
        </button>
      </div>
      <h1>{t('app.title')}</h1>
    </header>
  )
}

function AppMain({
  activeTab,
  status,
  places,
  listings,
  plantings,
  devices,
  account,
  now,
  growPrefillCropId,
  sellPrefill,
  findFoodOpenNeighborhood,
  conversations,
  openConversationId,
  onRetryLoad,
  onSaveListing,
  onUpdateListing,
  onRemoveListing,
  onAddPlanting,
  onRemovePlanting,
  onAddPlantingNote,
  onPairDevice,
  onDisconnectDevice,
  sharedReports,
  onRecordHarvest,
  onFinishPlanting,
  onShareReport,
  onUnshareReport,
  onListForSale,
  onConsumeSellPrefill,
  onConsumeGrowPrefill,
  onConsumeFindFoodOpen,
  onConsumeOpenConversation,
  onUpdateAccount,
  onStartTracking,
  onViewInFindFood,
  onGoToGarden,
  onGoToGrow,
  onGoToSell,
  onOpenSettings,
  onMessageSeller,
  onSendMessage,
  onSimulateReply,
  onMarkRead,
  onRateSeller,
  onViewOnMap,
  sellSubTabRequest,
  onConsumeSellSubTabRequest,
  sellFormKey,
  focusMapListingId,
  onConsumeFocusMapListing,
  communityPosts,
  communityDraftPlantingId,
  onConsumeCommunityDraft,
  onAskCommunity,
  onCreatePost,
  onAnswer,
  onVote,
  onAccept,
  onReport,
}) {
  const { t } = useI18n()

  return (
    <main className="app-content">
      {activeTab === 'find' && isValidTab(account, 'find') && (
        <>
          {status === 'loading' && <p className="app-message">{t('app.loadingPlaces')}</p>}
          {status === 'error' && (
            <div className="app-message app-message-error">
              <p>{t('app.loadError')}</p>
              <button type="button" className="app-retry-btn" onClick={onRetryLoad}>
                {t('app.retry')}
              </button>
            </div>
          )}
          {status === 'ready' && (
            <FindFoodTab
              sources={places}
              listings={listings}
              account={account}
              now={now}
              openNeighborhoodKey={findFoodOpenNeighborhood}
              onConsumeOpenNeighborhood={onConsumeFindFoodOpen}
              onMessageSeller={onMessageSeller}
            />
          )}
        </>
      )}
      {activeTab === 'messages' && isValidTab(account, 'messages') && (
        <MessagesTab
          conversations={conversations}
          openConversationId={openConversationId}
          onConsumeOpenConversation={onConsumeOpenConversation}
          onSendMessage={onSendMessage}
          onSimulateReply={onSimulateReply}
          onMarkRead={onMarkRead}
          onRateSeller={onRateSeller}
        />
      )}
      {activeTab === 'sell' && (
        <SellTab
          key={sellFormKey}
          listings={listings}
          now={now}
          prefill={sellPrefill}
          account={account}
          sources={places}
          onSaveListing={onSaveListing}
          onUpdateListing={onUpdateListing}
          onRemoveListing={onRemoveListing}
          onListForSale={onListForSale}
          onConsumePrefill={onConsumeSellPrefill}
          onUpdateAccount={onUpdateAccount}
          onGoToGarden={onGoToGarden}
          onViewInFindFood={onViewInFindFood}
          onOpenSettings={onOpenSettings}
          onViewOnMap={onViewOnMap}
          sellSubTabRequest={sellSubTabRequest}
          onConsumeSellSubTabRequest={onConsumeSellSubTabRequest}
          conversations={conversations}
          openConversationId={openConversationId}
          onConsumeOpenConversation={onConsumeOpenConversation}
          onSendMessage={onSendMessage}
          onSimulateReply={onSimulateReply}
          onMarkRead={onMarkRead}
          onRateSeller={onRateSeller}
        />
      )}
      {activeTab === 'grow' && isValidTab(account, 'grow') && (
        <GrowTab
          plantings={plantings}
          account={account}
          learnMode={Boolean(account.learnMode)}
          onToggleLearnMode={() => onUpdateAccount({ learnMode: !account.learnMode })}
          posts={communityPosts}
          sharedReports={sharedReports}
          communityDraftPlantingId={communityDraftPlantingId}
          onConsumeCommunityDraft={onConsumeCommunityDraft}
          onStartTracking={onStartTracking}
          onGoToGarden={onGoToGarden}
          onCreatePost={onCreatePost}
          onAnswer={onAnswer}
          onVote={onVote}
          onAccept={onAccept}
          onReport={onReport}
        />
      )}
      {activeTab === 'garden' && isValidTab(account, 'garden') && (
        <MyGarden
          plantings={plantings}
          listings={listings}
          account={account}
          devices={devices}
          prefillCropId={growPrefillCropId}
          now={now}
          onAddPlanting={onAddPlanting}
          onRemovePlanting={onRemovePlanting}
          onAddNote={onAddPlantingNote}
          onListForSale={onListForSale}
          onConsumePrefill={onConsumeGrowPrefill}
          onUpdateAccount={onUpdateAccount}
          onGoToGrow={onGoToGrow}
          onGoToSell={onGoToSell}
          onPairDevice={onPairDevice}
          onDisconnectDevice={onDisconnectDevice}
          sharedReports={sharedReports}
          onRecordHarvest={onRecordHarvest}
          onFinishPlanting={onFinishPlanting}
          onShareReport={onShareReport}
          onUnshareReport={onUnshareReport}
          onAskCommunity={onAskCommunity}
        />
      )}
      {activeTab === 'insights' && isValidTab(account, 'insights') && (
        <InsightsTab account={account} now={now} />
      )}
      {activeTab === 'map' && isValidTab(account, 'map') && (
        <MyMapTab
          account={account}
          listings={listings}
          sources={places}
          now={now}
          focusListingId={focusMapListingId}
          onConsumeFocusListing={onConsumeFocusMapListing}
          onGoToSell={onGoToSell}
          onListForSale={onListForSale}
        />
      )}
    </main>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(() => getFirstTab(getAccount()))
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')
  const [listings, setListings] = useState(() => getListings())
  const [plantings, setPlantings] = useState(() => getPlantings())
  const [devices, setDevices] = useState(() => getDevices())
  const [sharedReports, setSharedReports] = useState(() => getSharedReports())
  const [account, setAccount] = useState(() => getAccount())
  const [conversations, setConversations] = useState(() => getConversations())
  const [growPrefillCropId, setGrowPrefillCropId] = useState(null)
  const [sellPrefill, setSellPrefill] = useState(null)
  const [sellPrefillToken, setSellPrefillToken] = useState(0)
  const [findFoodOpenNeighborhood, setFindFoodOpenNeighborhood] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [openConversationId, setOpenConversationId] = useState(null)
  const [sellSubTabRequest, setSellSubTabRequest] = useState(null)
  const [focusMapListingId, setFocusMapListingId] = useState(null)
  const [communityPosts, setCommunityPosts] = useState(() => getCommunityPosts())
  const [communityDraftPlantingId, setCommunityDraftPlantingId] = useState(null)
  const now = useMemo(() => getNow(), [])
  const lang = account.language || 'en'

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tabs = useMemo(() => getTabsForAccount(account), [account.type])

  const [prevAccountType, setPrevAccountType] = useState(account.type)
  if (account.type !== prevAccountType) {
    setPrevAccountType(account.type)
    if (account.type === 'business' || !isValidTab(account, activeTab)) {
      setActiveTab(getFirstTab(account))
    }
  }

  const loadPlaces = useCallback(() => {
    setStatus('loading')
    fetchPlaces()
      .then((data) => {
        setPlaces(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlaces()
  }, [loadPlaces])

  function handleSaveListing(listing) {
    saveListing(listing, lang)
    setListings(getListings())
    setConversations(getConversations())
  }

  function handleUpdateListing(id, patch) {
    updateListing(id, patch)
    setListings(getListings())
  }

  function handleRemoveListing(id) {
    removeListing(id)
    setListings(getListings())
  }

  function handleAddPlanting(planting) {
    savePlanting(planting)
    setPlantings(getPlantings())
  }

  function handleRemovePlanting(id) {
    removePlanting(id)
    setPlantings(getPlantings())
    setDevices(getDevices())
    setSharedReports(getSharedReports())
  }

  function handleAddPlantingNote(plantingId, note) {
    try {
      addPlantingNote(plantingId, note)
    } catch {
      // Most likely storage is full (photos are the heavy part).
      return false
    }
    setPlantings(getPlantings())
    return true
  }

  function handlePairDevice(plantingId, method) {
    pairDevice({ plantingId, method })
    setDevices(getDevices())
  }

  function handleRecordHarvest(plantingId, harvest) {
    try {
      addPlantingHarvest(plantingId, harvest)
    } catch {
      // Most likely storage is full (photos are the heavy part).
      return false
    }
    setPlantings(getPlantings())
    return true
  }

  function handleFinishPlanting(plantingId) {
    finishPlanting(plantingId)
    setPlantings(getPlantings())
    setDevices(getDevices())
  }

  function handleShareReport(plantingId, options) {
    shareReport(plantingId, options)
    setSharedReports(getSharedReports())
    setAccount(getAccount())
  }

  function handleUnshareReport(plantingId) {
    unshareReport(plantingId)
    setSharedReports(getSharedReports())
  }

  function handleDisconnectDevice(plantingId) {
    unpairDevice(plantingId)
    setDevices(getDevices())
  }

  function handleUpdateAccount(patch) {
    const previousType = account.type
    updateAccount(patch)
    setAccount(getAccount())
    if (patch.type && patch.type !== previousType) {
      setSellPrefillToken((token) => token + 1)
    }
  }

  function handleResetDemoData() {
    resetDemoData()
    setListings(getListings())
    setCommunityPosts(getCommunityPosts())
    setSharedReports(getSharedReports())
  }

  function handleClearAllData() {
    clearAllData()
    setListings(getListings())
    setPlantings(getPlantings())
    setDevices(getDevices())
    setSharedReports(getSharedReports())
    setAccount(getAccount())
    setConversations(getConversations())
    setCommunityPosts(getCommunityPosts())
    setSellPrefillToken((token) => token + 1)
    setSettingsOpen(false)
    setActiveTab(getFirstTab(getAccount()))
  }

  const handleConsumeGrowPrefill = useCallback(() => setGrowPrefillCropId(null), [])
  const handleConsumeSellPrefill = useCallback(() => setSellPrefill(null), [])
  const handleConsumeFindFoodOpen = useCallback(() => setFindFoodOpenNeighborhood(null), [])
  const handleConsumeOpenConversation = useCallback(() => setOpenConversationId(null), [])
  const handleConsumeSellSubTabRequest = useCallback(() => setSellSubTabRequest(null), [])
  const handleConsumeFocusMapListing = useCallback(() => setFocusMapListingId(null), [])
  const handleConsumeCommunityDraft = useCallback(() => setCommunityDraftPlantingId(null), [])

  // Community writes may create the local author id, so refresh the account too.
  function refreshCommunity() {
    setCommunityPosts(getCommunityPosts())
    setAccount(getAccount())
  }

  function handleAskCommunity(plantingId) {
    setCommunityDraftPlantingId(plantingId)
    setActiveTab('grow')
  }

  function handleCreatePost(draft) {
    let post
    try {
      post = createCommunityPost(draft)
    } catch {
      // Most likely storage is full (photos are the heavy part).
      return null
    }
    refreshCommunity()
    return post
  }

  function handleAnswer(postId, body) {
    try {
      addCommunityAnswer(postId, body)
    } catch {
      return false
    }
    refreshCommunity()
    return true
  }

  function handleVote(postId, answerId, value) {
    voteCommunityItem(postId, answerId, value)
    refreshCommunity()
  }

  function handleAcceptAnswer(postId, answerId) {
    acceptCommunityAnswer(postId, answerId)
    refreshCommunity()
  }

  function handleReportItem(postId, answerId) {
    reportCommunityItem(postId, answerId)
    refreshCommunity()
  }

  function handleStartTracking(cropId) {
    setGrowPrefillCropId(cropId)
    setActiveTab('garden')
  }

  function handleListForSale(prefill) {
    setSellPrefill(prefill)
    setSellPrefillToken((token) => token + 1)
    setActiveTab('sell')
  }

  function handleViewInFindFood(neighborhoodKey) {
    setFindFoodOpenNeighborhood(neighborhoodKey)
    setActiveTab('find')
  }

  function handleMessageSeller(listing) {
    const conversation = findOrCreateConversation({ listing, role: 'buying', lang })
    setConversations(getConversations())
    setOpenConversationId(conversation.id)
    if (account.type === 'business') {
      setActiveTab('messages')
    } else {
      setActiveTab('sell')
      setSellSubTabRequest('messages')
    }
  }

  function handleSendMessage(conversationId, text) {
    appendMessage(conversationId, 'me', text)
    setConversations(getConversations())
  }

  function handleSimulateReply(conversationId, text) {
    appendMessage(conversationId, 'them', text)
    setConversations(getConversations())
  }

  function handleMarkRead(conversationId) {
    markConversationRead(conversationId)
    setConversations(getConversations())
  }

  function handleRateSeller(conversationId, stars, comment) {
    rateConversationSeller(conversationId, stars, comment)
    setConversations(getConversations())
  }

  function handleViewOnMap(listing) {
    if (listing) setFocusMapListingId(listing.id)
    setActiveTab('map')
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  const badges = account.type === 'business' ? { messages: totalUnread } : { sell: totalUnread }

  return (
    <I18nProvider lang={lang}>
      <div className="app">
        <AppHeader
          onOpenSettings={() => setSettingsOpen(true)}
          now={now}
        />

        <AppMain
          activeTab={activeTab}
          status={status}
          places={places}
          listings={listings}
          plantings={plantings}
          devices={devices}
          account={account}
          now={now}
          growPrefillCropId={growPrefillCropId}
          sellPrefill={sellPrefill}
          sellFormKey={sellPrefillToken}
          findFoodOpenNeighborhood={findFoodOpenNeighborhood}
          conversations={conversations}
          openConversationId={openConversationId}
          onRetryLoad={loadPlaces}
          onSaveListing={handleSaveListing}
          onUpdateListing={handleUpdateListing}
          onRemoveListing={handleRemoveListing}
          onAddPlanting={handleAddPlanting}
          onRemovePlanting={handleRemovePlanting}
          onAddPlantingNote={handleAddPlantingNote}
          onPairDevice={handlePairDevice}
          onDisconnectDevice={handleDisconnectDevice}
          sharedReports={sharedReports}
          onRecordHarvest={handleRecordHarvest}
          onFinishPlanting={handleFinishPlanting}
          onShareReport={handleShareReport}
          onUnshareReport={handleUnshareReport}
          onListForSale={handleListForSale}
          onConsumeSellPrefill={handleConsumeSellPrefill}
          onConsumeGrowPrefill={handleConsumeGrowPrefill}
          onConsumeFindFoodOpen={handleConsumeFindFoodOpen}
          onConsumeOpenConversation={handleConsumeOpenConversation}
          onUpdateAccount={handleUpdateAccount}
          onStartTracking={handleStartTracking}
          onViewInFindFood={handleViewInFindFood}
          onGoToGarden={() => setActiveTab('garden')}
          onGoToGrow={() => setActiveTab('grow')}
          onGoToSell={() => setActiveTab('sell')}
          onOpenSettings={() => setSettingsOpen(true)}
          onMessageSeller={handleMessageSeller}
          onSendMessage={handleSendMessage}
          onSimulateReply={handleSimulateReply}
          onMarkRead={handleMarkRead}
          onRateSeller={handleRateSeller}
          onViewOnMap={handleViewOnMap}
          sellSubTabRequest={sellSubTabRequest}
          onConsumeSellSubTabRequest={handleConsumeSellSubTabRequest}
          focusMapListingId={focusMapListingId}
          onConsumeFocusMapListing={handleConsumeFocusMapListing}
          communityPosts={communityPosts}
          communityDraftPlantingId={communityDraftPlantingId}
          onConsumeCommunityDraft={handleConsumeCommunityDraft}
          onAskCommunity={handleAskCommunity}
          onCreatePost={handleCreatePost}
          onAnswer={handleAnswer}
          onVote={handleVote}
          onAccept={handleAcceptAnswer}
          onReport={handleReportItem}
        />

        <TabBar tabs={tabs} activeTab={activeTab} onSelectTab={setActiveTab} badges={badges} />

        <SettingsPage
          open={settingsOpen}
          account={account}
          listings={listings}
          sources={places}
          now={now}
          onUpdateAccount={handleUpdateAccount}
          onClose={() => setSettingsOpen(false)}
          onResetDemoData={handleResetDemoData}
          onClearAllData={handleClearAllData}
        />

        <ChatFab
          places={places}
          listings={listings}
          plantings={plantings}
          devices={devices}
          account={account}
          now={now}
          onOpenTab={(tab) => {
            if (isValidTab(account, tab)) setActiveTab(tab)
          }}
        />
      </div>
    </I18nProvider>
  )
}

export default App
