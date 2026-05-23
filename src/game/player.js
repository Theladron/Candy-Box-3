import { getMaxHealth } from './formulas'

export const EQUIPMENT_SLOTS = ['weapon', 'chest', 'feet', 'hands', 'head']

export function getHpBarState(currentHp, maxHp) {
  const safeMax = Math.max(1, maxHp)
  const safeCurrent = Math.max(0, Math.min(currentHp, safeMax))
  const ratio = safeCurrent / safeMax

  let color = 'green'
  if (ratio < 0.1) {
    color = 'red'
  } else if (ratio < 0.4) {
    color = 'orange'
  }

  return { ratio, color }
}

export function eatAllCandies(state) {
  if (state.candies < 1) return state

  const previousMax = getMaxHealth(state.candiesEaten)
  const candiesEaten = state.candiesEaten + state.candies
  const nextMax = getMaxHealth(candiesEaten)
  const hpGain = nextMax - previousMax

  return {
    ...state,
    candiesEaten,
    candies: 0,
    currentHp: Math.min(nextMax, state.currentHp + hpGain),
  }
}

export function applyDamage(state, amount) {
  if (amount <= 0) return state

  return {
    ...state,
    currentHp: Math.max(0, state.currentHp - amount),
  }
}

export function syncHpToMax(state) {
  return {
    ...state,
    currentHp: getMaxHealth(state.candiesEaten),
  }
}
