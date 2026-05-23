import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { getVisibleMenuTabs } from '../game/menu'

export function Menu({ activeTab, onTabChange }) {
  const { state } = useGame()
  const { t } = useTranslation()

  if (!state.menuUnlocked) {
    return null
  }

  return (
    <nav className="game-menu" aria-label={t('menu.label')}>
      <ul className="game-menu-tabs">
        {getVisibleMenuTabs(state).map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              className={`game-menu-tab${
                activeTab === tab.id ? ' game-menu-tab--active' : ''
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => onTabChange(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
