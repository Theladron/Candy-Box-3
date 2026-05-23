import { GameProvider } from './context/GameContext'
import { GameShell } from './components/GameShell'

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  )
}
