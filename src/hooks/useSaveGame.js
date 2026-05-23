import { useEffect, useRef } from 'react'
import { ACTIONS } from '../game/actions'
import {
  AUTOSAVE_INTERVAL_MS,
  getAutosaveEnabled,
  getAutosaveSlot,
  getUrlSlotNumber,
  loadFromSlot,
  saveToSlot,
  setLastAutosaveAt,
  slotIdFromNumber,
} from '../game/save'
import { useGame } from '../context/GameContext'

export function useSaveGame() {
  const { state, dispatch } = useGame()
  const stateRef = useRef(state)
  const bootLoadDone = useRef(false)

  stateRef.current = state

  useEffect(() => {
    if (bootLoadDone.current) {
      return
    }
    bootLoadDone.current = true

    const slotNumber = getUrlSlotNumber()
    if (!slotNumber) {
      return
    }

    const result = loadFromSlot(slotIdFromNumber(slotNumber))
    if (result.ok) {
      dispatch({ type: ACTIONS.LOAD_GAME_STATE, state: result.state })
    }
  }, [dispatch])

  useEffect(() => {
    function runAutosave() {
      if (!getAutosaveEnabled()) {
        return
      }
      const slotId = getAutosaveSlot()
      const result = saveToSlot(slotId, stateRef.current)
      if (result.ok) {
        setLastAutosaveAt(new Date().toISOString())
      }
    }

    const intervalId = setInterval(runAutosave, AUTOSAVE_INTERVAL_MS)

    function handleBeforeUnload() {
      runAutosave()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
}
