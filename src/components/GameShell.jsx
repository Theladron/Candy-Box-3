import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { ACTIONS } from '../game/actions'
import { MAX_CANDY_DISPLAY_DIGITS } from '../game/formulas'
import { useGameTick } from '../hooks/useGameTick'
import { CandyDisplay } from './CandyDisplay'
import { CharacterDisplay } from './CharacterDisplay'
import { EatCandyButton } from './EatCandyButton'
import { EatenCandyDisplay } from './EatenCandyDisplay'
import { LollipopDisplay } from './LollipopDisplay'
import { Menu } from './Menu'
import { SavePanel } from './panels/SavePanel'
import { WanderingMerchantEncounter } from './WanderingMerchantEncounter'

function CandyBoxPanel() {
  return (
    <div className="candy-box-panel">
      <div
        className="candy-box-actions"
        style={{ '--candy-display-digits': MAX_CANDY_DISPLAY_DIGITS }}
      >
        <CandyDisplay />
        <LollipopDisplay />
        <EatenCandyDisplay />
        <EatCandyButton />
      </div>
      <WanderingMerchantEncounter />
    </div>
  )
}

function SettingsPanel() {
  return null
}

const PANELS = {
  candyBox: CandyBoxPanel,
  save: SavePanel,
  settings: SettingsPanel,
}

export function GameShell() {
  useGameTick()
  const { dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('candyBox')
  const ActivePanel = PANELS[activeTab] ?? CandyBoxPanel

  function handleTabChange(tab) {
    if (tab !== activeTab) {
      dispatch({ type: ACTIONS.CLEAR_MERCHANT_DIALOG })
    }
    setActiveTab(tab)
  }

  return (
    <main className="game-shell">
      <header className="game-shell-top">
        <div className="game-shell-top-corner">
          <CharacterDisplay />
        </div>
        <div className="game-shell-top-menu">
          <Menu activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </header>
      <div className="game-shell-main">
        <ActivePanel />
      </div>
    </main>
  )
}
