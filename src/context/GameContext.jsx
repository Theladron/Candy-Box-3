import { createContext, useContext, useReducer } from 'react'
import { initialState } from '../game/initialState'
import { gameReducer } from '../game/reducer'
import { useSaveGame } from '../hooks/useSaveGame'

const GameContext = createContext(null)

function SaveGameRunner() {
  useSaveGame()
  return null
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <SaveGameRunner />
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
