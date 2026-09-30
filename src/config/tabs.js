export const TABS_BY_ACCOUNT_TYPE = {
  neighbor: [
    { key: 'find', labelKey: 'tabs.find' },
    { key: 'sell', labelKey: 'tabs.sell' },
    { key: 'grow', labelKey: 'tabs.grow' },
    { key: 'garden', labelKey: 'tabs.garden' },
  ],
  business: [
    { key: 'map', labelKey: 'tabs.myMap' },
    { key: 'sell', labelKey: 'tabs.sell' },
    { key: 'messages', labelKey: 'tabs.messages' },
    { key: 'insights', labelKey: 'tabs.insights' },
  ],
}

export function getTabsForAccount(account) {
  return TABS_BY_ACCOUNT_TYPE[account?.type] ?? TABS_BY_ACCOUNT_TYPE.neighbor
}

export function isValidTab(account, tabKey) {
  return getTabsForAccount(account).some((tab) => tab.key === tabKey)
}

export function getFirstTab(account) {
  return getTabsForAccount(account)[0]?.key
}
