import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { ACTIONS } from '../game/actions'
import {
  canBuyMerchantItem,
  getVisibleMerchantCatalog,
  isMerchantItemOwned,
  MERCHANT_ITEMS,
  shouldShowMerchant,
  shouldShowStepsMessage,
} from '../game/merchant'
import { CHARACTER_DISPLAY_ART } from './ascii/CharacterDisplayArt'
import { LOLLIPOP_ART } from './ascii/LollipopArt'
import { MENU_ART } from './ascii/MenuArt'
import { WANDERING_MERCHANT_ART } from './ascii/WanderingMerchantArt'

const MERCHANT_ITEM_ART = {
  [MERCHANT_ITEMS.LOLLIPOP.id]: LOLLIPOP_ART,
  [MERCHANT_ITEMS.CHARACTER_DISPLAY.id]: CHARACTER_DISPLAY_ART,
  [MERCHANT_ITEMS.MENU.id]: MENU_ART,
}

function MerchantItem({ item }) {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()
  const owned = isMerchantItemOwned(state, item.id)
  const canBuy = canBuyMerchantItem(state, item.id)
  const art = MERCHANT_ITEM_ART[item.id]

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
            {t('merchant.price', { count: item.price })}
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
  const { state } = useGame()
  const { t } = useTranslation()

  if (shouldShowMerchant(state)) {
    return (
      <div className="merchant-encounter">
        <div className="merchant-art-block">
          <h2 className="merchant-heading">{t('merchant.wanderingMerchant')}</h2>
          <pre className="ascii-art">{WANDERING_MERCHANT_ART}</pre>
        </div>
        <div className="merchant-inventory">
          {getVisibleMerchantCatalog(state).map((item) => (
            <MerchantItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    )
  }

  if (shouldShowStepsMessage(state)) {
    return <p className="merchant-event">{t('merchant.stepsCloser')}</p>
  }

  return null
}
