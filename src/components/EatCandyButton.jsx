import { useTranslation } from 'react-i18next'
import { ACTIONS } from '../game/actions'
import { useGame } from '../context/GameContext'

export function EatCandyButton() {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()
  const canEat = state.candies > 0

  return (
    <p className="eat-candy">
      <button
        type="button"
        disabled={!canEat}
        onClick={() => dispatch({ type: ACTIONS.EAT_CANDY })}
      >
        {t('eatCandy.button')}
      </button>
      {!canEat && <span className="eat-candy-hint"> {t('eatCandy.noneHint')}</span>}
    </p>
  )
}
