export const MERCHANT_STEPS_THRESHOLD = 20
export const MERCHANT_APPEAR_THRESHOLD = 30
export const MERCHANT_LOLLIPOP_BASE_PRICE = 100
export const MERCHANT_HAT_MESSAGE_COUNT = 9
export const MERCHANT_HAT_ANNOYED_MESSAGE_INDEX = 2

const LOLLIPOP_PRICE_BY_HAT_MESSAGE = {
  4: 90,
  5: 80,
  6: 70,
  7: 60,
  8: 70,
}

export const MERCHANT_ITEMS = {
  LOLLIPOP: {
    id: 'lollipop',
    nameKey: 'merchant.items.lollipop',
    price: MERCHANT_LOLLIPOP_BASE_PRICE,
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

export function getMerchantItemPrice(state, itemId) {
  if (itemId === MERCHANT_ITEMS.LOLLIPOP.id) {
    return state.merchantLollipopPrice
  }

  const item = MERCHANT_CATALOG.find((entry) => entry.id === itemId)
  return item?.price ?? 0
}

export function canClickMerchantHat(state) {
  return (
    shouldShowMerchant(state) &&
    state.merchantHatClickCount < MERCHANT_HAT_MESSAGE_COUNT
  )
}

export function shouldShowAnnoyedMerchantArt(state) {
  return (
    state.merchantHatMessageIndex !== null &&
    state.merchantHatMessageIndex >= MERCHANT_HAT_ANNOYED_MESSAGE_INDEX
  )
}

export function clickMerchantHat(state) {
  if (!canClickMerchantHat(state)) {
    return state
  }

  const messageIndex = state.merchantHatClickCount
  const nextPrice =
    LOLLIPOP_PRICE_BY_HAT_MESSAGE[messageIndex] ?? state.merchantLollipopPrice

  return {
    ...state,
    merchantHatClickCount: messageIndex + 1,
    merchantHatMessageIndex: messageIndex,
    merchantLollipopPrice: nextPrice,
  }
}

export function clearMerchantHatMessage(state) {
  if (state.merchantHatMessageIndex === null) {
    return state
  }

  return { ...state, merchantHatMessageIndex: null }
}

export function getVisibleMerchantCatalog(state) {
  return MERCHANT_CATALOG.filter(
    (item) => item.repeatable || !isMerchantItemOwned(state, item.id),
  )
}

export function canBuyMerchantItem(state, itemId) {
  const item = MERCHANT_CATALOG.find((entry) => entry.id === itemId)
  if (!item) {
    return false
  }

  const price = getMerchantItemPrice(state, itemId)
  if (state.candies < price) {
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

  const price = getMerchantItemPrice(state, itemId)
  const nextState = { ...state, candies: state.candies - price }

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
