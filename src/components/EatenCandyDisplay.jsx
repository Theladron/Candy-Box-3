import { Trans, useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'

export function EatenCandyDisplay() {
  const { state } = useGame()
  const { t } = useTranslation()

  if (state.candiesEaten < 1) {
    return null
  }

  return (
    <p className="eaten-candy-display">
      <Trans
        i18nKey="candy.eaten"
        count={state.candiesEaten}
        values={{ count: state.candiesEaten }}
        components={{ strong: <strong /> }}
        t={t}
      />
    </p>
  )
}
