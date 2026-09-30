import { useI18n } from '../i18n/useI18n'
import TabIcon from './TabIcon'
import './TabBar.css'

function TabBar({ tabs, activeTab, onSelectTab, badges = {} }) {
  const { t } = useI18n()

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tab-bar-btn${activeTab === tab.key ? ' active' : ''}`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          onClick={() => onSelectTab(tab.key)}
        >
          <span className="tab-bar-icon-pill">
            <TabIcon name={tab.key} />
          </span>
          <span className="tab-bar-label">{t(tab.labelKey)}</span>
          {badges[tab.key] > 0 && <span className="tab-bar-badge">{badges[tab.key]}</span>}
        </button>
      ))}
    </nav>
  )
}

export default TabBar
