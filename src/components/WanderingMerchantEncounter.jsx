import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { ACTIONS } from '../game/actions'
import {
  canBuyMerchantItem,
  canClickMerchantHat,
  canClickMerchantStick,
  formatCompactLps,
  getMerchantItemCurrency,
  getMerchantItemPrice,
  getVisibleMerchantCatalog,
  isMerchantItemOwned,
  MERCHANT_CURRENCIES,
  MERCHANT_ITEMS,
  shouldShowAnnoyedMerchantArt,
  shouldShowMerchant,
  shouldShowStepsMessage,
} from '../game/merchant'
import { CHARACTER_DISPLAY_ART } from './ascii/CharacterDisplayArt'
import { LOLLIPOP_ART } from './ascii/LollipopArt'
import { MENU_ART } from './ascii/MenuArt'
import { WANDERING_MERCHANT_ANNOYED_ART } from './ascii/WanderingMerchantAnnoyedArt'
import { WANDERING_MERCHANT_ART } from './ascii/WanderingMerchantArt'
import { MERCHANT_STICK_HITBOXES } from './merchantStickHitboxes'

const MERCHANT_ITEM_ART = {
  [MERCHANT_ITEMS.LOLLIPOP.id]: LOLLIPOP_ART,
  [MERCHANT_ITEMS.CHARACTER_DISPLAY.id]: CHARACTER_DISPLAY_ART,
  [MERCHANT_ITEMS.MENU.id]: MENU_ART,
}

function MerchantDialog() {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()

  const showStickOffer =
    state.merchantStickOfferVisible && !state.merchantWalkingStickOwned
  const showHatMessage =
    !showStickOffer && state.merchantHatMessageIndex !== null

  if (!showStickOffer && !showHatMessage) {
    return null
  }

  const message = showStickOffer
    ? t('merchant.stickOfferMessage')
    : t(`merchant.hatMessages.${state.merchantHatMessageIndex}`)

  const walkingStick = MERCHANT_ITEMS.WALKING_STICK
  const walkingStickPrice = getMerchantItemPrice(state, walkingStick.id)
  const canBuyStick = canBuyMerchantItem(state, walkingStick.id)

  function handleBuyStick() {
    dispatch({ type: ACTIONS.BUY_MERCHANT_ITEM, itemId: walkingStick.id })
  }

  return (
  <>
      <span className="merchant-dialog-spacer" aria-hidden="true" />
      <div className="merchant-dialog">
        <p className="merchant-dialog-message">{message}</p>
        {showStickOffer ? (
          <button
            type="button"
            className="merchant-dialog-buy"
            disabled={!canBuyStick}
            onClick={handleBuyStick}
          >
            {t('merchant.hiddenBuy', {
              name: t(walkingStick.nameKey),
              price: formatCompactLps(walkingStickPrice),
            })}
          </button>
        ) : null}
      </div>
    </>
  )
}

function MerchantItem({ item }) {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()
  const owned = isMerchantItemOwned(state, item.id)
  const price = getMerchantItemPrice(state, item.id)
  const canBuy = canBuyMerchantItem(state, item.id)
  const art = MERCHANT_ITEM_ART[item.id]
  const currency = getMerchantItemCurrency(item.id)
  const priceKey =
    currency === MERCHANT_CURRENCIES.LOLLIPOPS
      ? 'merchant.lollipopPrice'
      : 'merchant.price'

  function handleBuy() {
    dispatch({ type: ACTIONS.BUY_MERCHANT_ITEM, itemId: item.id })
  }

  return (
    <div className="merchant-item">
      {art ? <pre className="merchant-item-art">{art}</pre> : null}
      <div className="merchant-item-details">
        <p className="merchant-item-name">{t(item.nameKey)}</p>
        {owned ? (
          <p className="merchant-item-status">{t('merchant.purchased')}</p>
        ) : (
          <p className="merchant-item-price">
            {t(priceKey, { count: price })}
          </p>
        )}
        {!owned || item.repeatable ? (
          <button type="button" onClick={handleBuy} disabled={!canBuy}>
            {t('merchant.buy')}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function WanderingMerchantEncounter() {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()

  function handleHatClick() {
    dispatch({ type: ACTIONS.CLICK_MERCHANT_HAT })
  }

  function handleStickClick() {
    dispatch({ type: ACTIONS.CLICK_MERCHANT_STICK })
  }

  if (shouldShowMerchant(state)) {
    const merchantArt = shouldShowAnnoyedMerchantArt(state)
      ? WANDERING_MERCHANT_ANNOYED_ART
      : WANDERING_MERCHANT_ART

    return (
      <div className="merchant-encounter">
        <div className="merchant-art-block">
          <h2 className="merchant-heading">{t('merchant.wanderingMerchant')}</h2>
          <div className="merchant-art-wrap">
            <pre className="ascii-art">{merchantArt}</pre>
            {canClickMerchantHat(state) ? (
              <button
                type="button"
                className="merchant-hat-hitbox"
                aria-label={t('merchant.hatClickLabel')}
                onClick={handleHatClick}
              />
            ) : null}
            {canClickMerchantStick(state)
              ? MERCHANT_STICK_HITBOXES.map((hitbox, index) => (
                  <button
                    key={index}
                    type="button"
                    className="merchant-stick-hitbox"
                    style={hitbox}
                    aria-label={
                      index === 0 ? t('merchant.stickClickLabel') : undefined
                    }
                    aria-hidden={index === 0 ? undefined : true}
                    tabIndex={index === 0 ? 0 : -1}
                    onClick={handleStickClick}
                  />
                ))
              : null}
          </div>
        </div>
        <div className="merchant-inventory">
          {getVisibleMerchantCatalog(state).map((item) => {
            if (item.id === MERCHANT_ITEMS.LOLLIPOP.id) {
              return (
                <div key={item.id} className="merchant-lollipop-slot">
                  <MerchantDialog />
                  <MerchantItem item={item} />
                </div>
              )
            }

            return <MerchantItem key={item.id} item={item} />
          })}
        </div>
      </div>
    )
  }

  if (shouldShowStepsMessage(state)) {
    return <p className="merchant-event">{t('merchant.stepsCloser')}</p>
  }

  return null
}
