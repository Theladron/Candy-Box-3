import { Trans, useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'

export function CandyDisplay() {
  const { state } = useGame()
  const { t } = useTranslation()

  return (
    <p className="candy-display">
      <Trans
        i18nKey="candy.youHave"
        count={state.candies}
        values={{ count: state.candies }}
        components={{ strong: <strong /> }}
        t={t}
      />
    </p>
  )
}
