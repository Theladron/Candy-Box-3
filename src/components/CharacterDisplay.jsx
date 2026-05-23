import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame } from '../context/GameContext'
import { getMaxHealth } from '../game/formulas'
import { EQUIPMENT_SLOTS, getHpBarState } from '../game/player'

function HpBar({ currentHp, maxHp }) {
  const { ratio, color } = getHpBarState(currentHp, maxHp)

  return (
    <div className="character-display-hp">
      <div className="character-display-hp-track">
        <div
          className={`character-display-hp-fill character-display-hp-fill--${color}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="character-display-hp-text">{currentHp}</span>
    </div>
  )
}

export function CharacterDisplay() {
  const { state } = useGame()
  const { t } = useTranslation()

  if (!state.characterDisplayUnlocked) {
    return null
  }

  const maxHp = getMaxHealth(state.candiesEaten)

  return (
    <aside className="character-display" aria-label={t('characterDisplay.label')}>
      <HpBar currentHp={state.currentHp} maxHp={maxHp} />
      <h2 className="character-display-heading">{t('characterDisplay.equipment')}</h2>
      <dl className="character-display-equipment">
        {EQUIPMENT_SLOTS.map((slot) => (
          <Fragment key={slot}>
            <dt>{t(`equipment.${slot}`)}</dt>
            <dd>{state.equipment[slot] ?? t('characterDisplay.none')}</dd>
          </Fragment>
        ))}
      </dl>
      <h2 className="character-display-heading">{t('characterDisplay.magic')}</h2>
    </aside>
  )
}
