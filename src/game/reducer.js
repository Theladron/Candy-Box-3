import { ACTIONS } from './actions'
import {
  buyMerchantItem,
  clearMerchantDialog,
  clickMerchantHat,
  clickMerchantStick,
  resolveMerchantEncounter,
} from './merchant'
import { applyDamage, eatAllCandies } from './player'

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.TICK:
      return resolveMerchantEncounter({
        ...state,
        candies: state.candies + state.candiesPerSecond,
      })
    case ACTIONS.EAT_CANDY:
      return eatAllCandies(resolveMerchantEncounter(state))
    case ACTIONS.BUY_MERCHANT_ITEM:
      return buyMerchantItem(state, action.itemId)
    case ACTIONS.TAKE_DAMAGE:
      return applyDamage(state, action.amount)
    case ACTIONS.CLICK_MERCHANT_HAT:
      return clickMerchantHat(state)
    case ACTIONS.CLICK_MERCHANT_STICK:
      return clickMerchantStick(state)
    case ACTIONS.CLEAR_MERCHANT_DIALOG:
      return clearMerchantDialog(state)
    default:
      return state
  }
}
