import MessagesPanel from './MessagesPanel'

function MessagesTab({
  conversations,
  openConversationId,
  onConsumeOpenConversation,
  onSendMessage,
  onSimulateReply,
  onMarkRead,
  onRateSeller,
}) {
  return (
    <MessagesPanel
      conversations={conversations}
      openConversationId={openConversationId}
      onConsumeOpenConversation={onConsumeOpenConversation}
      onSendMessage={onSendMessage}
      onSimulateReply={onSimulateReply}
      onMarkRead={onMarkRead}
      onRateSeller={onRateSeller}
    />
  )
}

export default MessagesTab
