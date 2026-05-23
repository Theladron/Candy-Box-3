import { useEffect } from 'react'
import { ACTIONS } from '../game/actions'
import { useGame } from '../context/GameContext'

export function useGameTick() {
  const { dispatch } = useGame()

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: ACTIONS.TICK })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [dispatch])
}
