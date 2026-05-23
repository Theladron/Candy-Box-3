export const MERCHANT_STEPS_THRESHOLD = 20
export const MERCHANT_APPEAR_THRESHOLD = 30

export const MERCHANT_ITEMS = {
  LOLLIPOP: {
    id: 'lollipop',
    nameKey: 'merchant.items.lollipop',
    price: 100,
    repeatable: true,
  },
  CHARACTER_DISPLAY: {
    id: 'characterDisplay',
    nameKey: 'merchant.items.characterDisplay',
    price: 20,
    repeatable: false,
  },
  MENU: {
    id: 'menu',
    nameKey: 'merchant.items.menu',
    price: 15,
    repeatable: false,
  },
}

export const MERCHANT_CATALOG = [
  MERCHANT_ITEMS.LOLLIPOP,
  MERCHANT_ITEMS.CHARACTER_DISPLAY,
  MERCHANT_ITEMS.MENU,
]

export function shouldShowStepsMessage(state) {
  return (
    !state.merchantAppeared &&
    state.candies >= MERCHANT_STEPS_THRESHOLD &&
    state.candies < MERCHANT_APPEAR_THRESHOLD
  )
}

export function shouldShowMerchant(state) {
  return state.merchantAppeared
}

export function resolveMerchantEncounter(state) {
  if (state.merchantAppeared || state.candies < MERCHANT_APPEAR_THRESHOLD) {
    return state
  }
  return { ...state, merchantAppeared: true }
}

export function isMerchantItemOwned(state, itemId) {
  switch (itemId) {
    case MERCHANT_ITEMS.CHARACTER_DISPLAY.id:
      return state.characterDisplayUnlocked
    case MERCHANT_ITEMS.MENU.id:
      return state.menuUnlocked
    default:
      return false
  }
}

export function getVisibleMerchantCatalog(state) {
  return MERCHANT_CATALOG.filter(
    (item) => item.repeatable || !isMerchantItemOwned(state, item.id),
  )
}

export function canBuyMerchantItem(state, itemId) {
  const item = MERCHANT_CATALOG.find((entry) => entry.id === itemId)
  if (!item || state.candies < item.price) {
    return false
  }
  if (!item.repeatable && isMerchantItemOwned(state, itemId)) {
    return false
  }
  return true
}

export function buyMerchantItem(state, itemId) {
  if (!canBuyMerchantItem(state, itemId)) {
    return state
  }

  const item = MERCHANT_CATALOG.find((entry) => entry.id === itemId)
  const nextState = { ...state, candies: state.candies - item.price }

  switch (itemId) {
    case MERCHANT_ITEMS.LOLLIPOP.id:
      return { ...nextState, lollipops: state.lollipops + 1 }
    case MERCHANT_ITEMS.CHARACTER_DISPLAY.id:
      return { ...nextState, characterDisplayUnlocked: true }
    case MERCHANT_ITEMS.MENU.id:
      return { ...nextState, menuUnlocked: true }
    default:
      return state
  }
}
