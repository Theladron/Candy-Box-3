import { MAP_MENU_TAB, MENU_TABS } from './menuTabs'

export function getVisibleMenuTabs(state) {
  if (!state.mapUnlocked) {
    return MENU_TABS
  }

  const candyBoxTab = MENU_TABS[0]
  const rest = MENU_TABS.slice(1)
  return [candyBoxTab, MAP_MENU_TAB, ...rest]
}
