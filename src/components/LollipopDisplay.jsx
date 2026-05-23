import { Trans, useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'

export function LollipopDisplay() {
  const { state } = useGame()
  const { t } = useTranslation()

  if (state.lollipops < 1) {
    return null
  }

  return (
    <p className="lollipop-display">
      <Trans
        i18nKey="lollipop.youHave"
        count={state.lollipops}
        values={{ count: state.lollipops }}
        components={{ strong: <strong /> }}
        t={t}
      />
    </p>
  )
}
