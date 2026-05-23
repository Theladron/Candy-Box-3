import { useState } from 'react'
import { useGameTick } from '../hooks/useGameTick'
import { CandyDisplay } from './CandyDisplay'
import { CharacterDisplay } from './CharacterDisplay'
import { EatCandyButton } from './EatCandyButton'
import { Menu } from './Menu'
import { WanderingMerchantEncounter } from './WanderingMerchantEncounter'

function CandyBoxPanel() {
  return (
    <>
      <CandyDisplay />
      <EatCandyButton />
      <WanderingMerchantEncounter />
    </>
  )
}

function SavePanel() {
  return null
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
  const [activeTab, setActiveTab] = useState('candyBox')
  const ActivePanel = PANELS[activeTab] ?? CandyBoxPanel

  return (
    <main className="game-shell">
      <header className="game-shell-top">
        <div className="game-shell-top-corner">
          <CharacterDisplay />
        </div>
        <div className="game-shell-top-menu">
          <Menu activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>
      <div className="game-shell-main">
        <ActivePanel />
      </div>
    </main>
  )
}
