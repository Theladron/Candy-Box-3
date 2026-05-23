import { ACTIONS } from './actions'
import { initialState } from './initialState'
import {
  askMerchantWhereAmI,
  buyMerchantItem,
  clearMerchantDialog,
  clickMerchantHat,
  clickMerchantMap,
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
    case ACTIONS.ASK_MERCHANT_WHERE_AM_I:
      return askMerchantWhereAmI(state)
    case ACTIONS.CLICK_MERCHANT_MAP:
      return clickMerchantMap(state)
    case ACTIONS.LOAD_GAME_STATE:
      return action.state
    case ACTIONS.RESET_GAME:
      return { ...initialState }
    default:
      return state
  }
}
