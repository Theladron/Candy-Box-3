export const MERCHANT_STEPS_THRESHOLD = 20
export const MERCHANT_APPEAR_THRESHOLD = 30
export const MERCHANT_LOLLIPOP_BASE_PRICE = 100
export const MERCHANT_WALKING_STICK_PRICE = 100_000
export const MERCHANT_HAT_MESSAGE_COUNT = 9
export const MERCHANT_HAT_ANNOYED_MESSAGE_INDEX = 2
export const MERCHANT_MAP_BASE_PRICE = 500
export const MERCHANT_MAP_TOUCH_MESSAGE_COUNT = 3
export const MERCHANT_MAP_ANNOYED_MESSAGE_INDEX = 1

const MAP_PRICE_BY_TOUCH = {
  0: 400,
  1: 300,
  2: 0,
}

export const MERCHANT_CURRENCIES = {
  CANDIES: 'candies',
  LOLLIPOPS: 'lollipops',
}

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
    currency: MERCHANT_CURRENCIES.CANDIES,
    repeatable: true,
  },
  CHARACTER_DISPLAY: {
    id: 'characterDisplay',
    nameKey: 'merchant.items.characterDisplay',
    price: 20,
    currency: MERCHANT_CURRENCIES.CANDIES,
    repeatable: false,
  },
  MENU: {
    id: 'menu',
    nameKey: 'merchant.items.menu',
    price: 15,
    currency: MERCHANT_CURRENCIES.CANDIES,
    repeatable: false,
  },
  WALKING_STICK: {
    id: 'walkingStick',
    nameKey: 'merchant.items.walkingStick',
    price: MERCHANT_WALKING_STICK_PRICE,
    currency: MERCHANT_CURRENCIES.LOLLIPOPS,
    repeatable: false,
  },
  MAP: {
    id: 'map',
    nameKey: 'merchant.items.map',
    price: MERCHANT_MAP_BASE_PRICE,
    currency: MERCHANT_CURRENCIES.CANDIES,
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
    case MERCHANT_ITEMS.WALKING_STICK.id:
      return state.merchantWalkingStickOwned
    case MERCHANT_ITEMS.MAP.id:
      return state.mapUnlocked
    default:
      return false
  }
}

export function getMerchantItemPrice(state, itemId) {
  if (itemId === MERCHANT_ITEMS.LOLLIPOP.id) {
    return state.merchantLollipopPrice
  }
  if (itemId === MERCHANT_ITEMS.MAP.id) {
    return state.merchantMapPrice
  }

  const item = Object.values(MERCHANT_ITEMS).find((entry) => entry.id === itemId)
  return item?.price ?? 0
}

export function isMerchantMapFree(state) {
  return getMerchantItemPrice(state, MERCHANT_ITEMS.MAP.id) === 0
}

export function getMerchantItemCurrency(itemId) {
  const item = Object.values(MERCHANT_ITEMS).find((entry) => entry.id === itemId)
  return item?.currency ?? MERCHANT_CURRENCIES.CANDIES
}

export function canAffordMerchantItem(state, itemId, price) {
  const currency = getMerchantItemCurrency(itemId)
  if (currency === MERCHANT_CURRENCIES.LOLLIPOPS) {
    return state.lollipops >= price
  }
  return state.candies >= price
}

export function canClickMerchantHat(state) {
  return (
    shouldShowMerchant(state) &&
    state.merchantHatClickCount < MERCHANT_HAT_MESSAGE_COUNT
  )
}

export function canClickMerchantStick(state) {
  return shouldShowMerchant(state) && !state.merchantWalkingStickOwned
}

export function canShowWhereAmITalk(state) {
  return (
    shouldShowMerchant(state) &&
    state.menuUnlocked &&
    state.characterDisplayUnlocked &&
    !state.merchantWhereAmIAsked
  )
}

export function shouldShowMerchantMap(state) {
  return state.merchantMapOfferActive && !state.mapUnlocked
}

export function canClickMerchantMap(state) {
  return (
    shouldShowMerchantMap(state) &&
    state.merchantMapClickCount < MERCHANT_MAP_TOUCH_MESSAGE_COUNT
  )
}

export function shouldShowAnnoyedMerchantArt(state) {
  const hatAnnoyed =
    state.merchantHatMessageIndex !== null &&
    state.merchantHatMessageIndex >= MERCHANT_HAT_ANNOYED_MESSAGE_INDEX
  const mapAnnoyed =
    state.merchantMapMessageIndex !== null &&
    state.merchantMapMessageIndex >= MERCHANT_MAP_ANNOYED_MESSAGE_INDEX
  return hatAnnoyed || mapAnnoyed
}

export function formatCompactLps(amount) {
  if (amount >= 1000 && amount % 1000 === 0) {
    return `${amount / 1000}k`
  }
  return String(amount)
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
    merchantStickOfferVisible: false,
    merchantMapOfferDialogVisible: false,
    merchantMapMessageIndex: null,
    merchantLollipopPrice: nextPrice,
  }
}

export function clickMerchantStick(state) {
  if (!canClickMerchantStick(state)) {
    return state
  }

  return {
    ...state,
    merchantStickOfferVisible: true,
    merchantHatMessageIndex: null,
    merchantMapOfferDialogVisible: false,
    merchantMapMessageIndex: null,
  }
}

export function askMerchantWhereAmI(state) {
  if (!canShowWhereAmITalk(state)) {
    return state
  }

  return {
    ...state,
    merchantWhereAmIAsked: true,
    merchantMapOfferActive: true,
    merchantMapOfferDialogVisible: true,
    merchantMapPrice: MERCHANT_MAP_BASE_PRICE,
    merchantHatMessageIndex: null,
    merchantStickOfferVisible: false,
    merchantMapMessageIndex: null,
  }
}

export function clickMerchantMap(state) {
  if (!canClickMerchantMap(state)) {
    return state
  }

  const messageIndex = state.merchantMapClickCount
  const nextPrice = MAP_PRICE_BY_TOUCH[messageIndex] ?? state.merchantMapPrice

  return {
    ...state,
    merchantMapClickCount: messageIndex + 1,
    merchantMapMessageIndex: messageIndex,
    merchantMapOfferDialogVisible: false,
    merchantMapPrice: nextPrice,
    merchantHatMessageIndex: null,
    merchantStickOfferVisible: false,
  }
}

export function clearMerchantDialog(state) {
  const nextState = { ...state }

  if (state.merchantHatMessageIndex !== null) {
    nextState.merchantHatMessageIndex = null
  }

  if (state.merchantStickOfferVisible) {
    nextState.merchantStickOfferVisible = false
  }

  if (state.merchantMapOfferDialogVisible) {
    nextState.merchantMapOfferDialogVisible = false
  }

  if (state.merchantMapMessageIndex !== null) {
    nextState.merchantMapMessageIndex = null
  }

  return nextState
}

export function getVisibleMerchantCatalog(state) {
  return MERCHANT_CATALOG.filter(
    (item) => item.repeatable || !isMerchantItemOwned(state, item.id),
  )
}

export function canBuyMerchantItem(state, itemId) {
  const item = Object.values(MERCHANT_ITEMS).find((entry) => entry.id === itemId)
  if (!item) {
    return false
  }

  if (!item.repeatable && isMerchantItemOwned(state, itemId)) {
    return false
  }

  const price = getMerchantItemPrice(state, itemId)
  if (price === 0) {
    return true
  }

  if (!canAffordMerchantItem(state, itemId, price)) {
    return false
  }

  return true
}

export function buyMerchantItem(state, itemId) {
  if (!canBuyMerchantItem(state, itemId)) {
    return state
  }

  const price = getMerchantItemPrice(state, itemId)
  const currency = getMerchantItemCurrency(itemId)
  const nextState =
    price === 0
      ? { ...state }
      : {
          ...state,
          ...(currency === MERCHANT_CURRENCIES.LOLLIPOPS
            ? { lollipops: state.lollipops - price }
            : { candies: state.candies - price }),
        }

  switch (itemId) {
    case MERCHANT_ITEMS.LOLLIPOP.id:
      return { ...nextState, lollipops: nextState.lollipops + 1 }
    case MERCHANT_ITEMS.CHARACTER_DISPLAY.id:
      return { ...nextState, characterDisplayUnlocked: true }
    case MERCHANT_ITEMS.MENU.id:
      return { ...nextState, menuUnlocked: true }
    case MERCHANT_ITEMS.WALKING_STICK.id:
      return {
        ...nextState,
        merchantWalkingStickOwned: true,
        merchantStickOfferVisible: false,
        equipment: {
          ...state.equipment,
          weapon: 'merchantWalkingStick',
        },
      }
    case MERCHANT_ITEMS.MAP.id:
      return {
        ...nextState,
        mapUnlocked: true,
        merchantMapOfferActive: false,
        merchantMapOfferDialogVisible: false,
        merchantMapMessageIndex: null,
      }
    default:
      return state
  }
}
