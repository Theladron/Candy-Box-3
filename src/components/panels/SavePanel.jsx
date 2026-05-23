import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ACTIONS } from '../../game/actions'
import {
  SLOT_IDS,
  exportSaveText,
  getAutosaveCountdownMs,
  getAutosaveEnabled,
  getAutosaveSlot,
  getSlotSummary,
  importSaveText,
  loadFromSlot,
  saveToSlot,
  setAutosaveEnabled,
  setAutosaveSlot,
  setLastAutosaveAt,
  setUrlSlotNumber,
  slotIdFromNumber,
} from '../../game/save'
import { useGame } from '../../context/GameContext'

function formatSavedAt(isoString, locale) {
  if (!isoString) {
    return null
  }
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toLocaleString(locale)
}

function slotNumberFromId(slotId) {
  return parseInt(slotId.replace('slot', ''), 10)
}

function SlotSelect({ id, label, value, onChange, slotSummaries, t, i18n }) {
  return (
    <>
      <label className="save-slot-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="save-slot-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {slotSummaries.map(({ slotId, empty, savedAt, candies }) => {
          const num = slotNumberFromId(slotId)
          const dateLabel = empty
            ? t('save.local.slotEmpty')
            : formatSavedAt(savedAt, i18n.language) ?? t('save.local.slotUnknownDate')
          const candyLabel =
            candies != null
              ? t('save.local.slotCandies', { count: candies })
              : t('save.local.slotUnknownCandies')
          return (
            <option key={slotId} value={num}>
              {t('save.local.slotOption', {
                slot: num,
                date: dateLabel,
                candies: candyLabel,
              })}
            </option>
          )
        })}
      </select>
    </>
  )
}

export function SavePanel() {
  const { state, dispatch } = useGame()
  const { t, i18n } = useTranslation()
  const [selectedSlot, setSelectedSlot] = useState(1)
  const [exportText, setExportText] = useState('')
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState(null)
  const [autosaveOn, setAutosaveOn] = useState(() => getAutosaveEnabled())
  const [autosaveSlotId, setAutosaveSlotId] = useState(() => getAutosaveSlot())
  const [countdownMs, setCountdownMs] = useState(() => getAutosaveCountdownMs())
  const [slotSummaries, setSlotSummaries] = useState(() =>
    SLOT_IDS.map((id) => ({ slotId: id, ...getSlotSummary(id) }))
  )

  const refreshSummaries = useCallback(() => {
    setSlotSummaries(
      SLOT_IDS.map((id) => ({ slotId: id, ...getSlotSummary(id) }))
    )
  }, [])

  const showMessage = useCallback(
    (key, options) => {
      setMessage(t(key, options))
    },
    [t]
  )

  const selectedSlotId = slotIdFromNumber(selectedSlot)

  useEffect(() => {
    if (!autosaveOn) {
      setCountdownMs(null)
      return undefined
    }

    function tick() {
      setCountdownMs(getAutosaveCountdownMs())
    }

    tick()
    const intervalId = setInterval(tick, 1000)
    return () => clearInterval(intervalId)
  }, [autosaveOn, autosaveSlotId])

  function handleSave() {
    const result = saveToSlot(selectedSlotId, state)
    if (result.ok) {
      refreshSummaries()
      showMessage('save.messages.saved', { slot: selectedSlot })
    } else {
      showMessage(`save.errors.${result.error}`)
    }
  }

  function handleEnableAutosave() {
    setAutosaveEnabled(true)
    setAutosaveSlot(selectedSlotId)
    setAutosaveOn(true)
    setAutosaveSlotId(selectedSlotId)
    const result = saveToSlot(selectedSlotId, state)
    if (result.ok) {
      setLastAutosaveAt(new Date().toISOString())
    }
    refreshSummaries()
    showMessage('save.messages.autosaveEnabled', { slot: selectedSlot })
  }

  function handleDisableAutosave() {
    setAutosaveEnabled(false)
    setAutosaveOn(false)
    showMessage('save.messages.autosaveDisabled')
  }

  function handleLoadSlot() {
    const slotId = slotIdFromNumber(selectedSlot)
    const result = loadFromSlot(slotId)
    if (result.ok) {
      dispatch({ type: ACTIONS.LOAD_GAME_STATE, state: result.state })
      setUrlSlotNumber(selectedSlot)
      setMessage(null)
      showMessage('save.messages.loaded', { slot: selectedSlot })
    } else {
      showMessage(`save.errors.${result.error}`, { slot: selectedSlot })
    }
  }

  function handleRestart() {
    if (!window.confirm(t('save.restart.confirm'))) {
      return
    }
    dispatch({ type: ACTIONS.RESET_GAME })
    setUrlSlotNumber(null)
    setMessage(null)
    showMessage('save.messages.restarted')
  }

  function handleExport() {
    setExportText(exportSaveText(state))
    setMessage(null)
  }

  async function handleCopyExport() {
    const text = exportText || exportSaveText(state)
    try {
      await navigator.clipboard.writeText(text)
      if (!exportText) {
        setExportText(text)
      }
      showMessage('save.messages.copied')
    } catch {
      showMessage('save.errors.copy_failed')
    }
  }

  function handleImport() {
    const result = importSaveText(importText)
    if (result.ok) {
      dispatch({ type: ACTIONS.LOAD_GAME_STATE, state: result.state })
      setImportText('')
      setMessage(null)
      showMessage('save.messages.imported')
    } else {
      showMessage(`save.errors.${result.error}`)
    }
  }

  const countdownMinutes =
    countdownMs != null ? Math.ceil(countdownMs / 60_000) : null

  return (
    <div className="save-panel">
      <section className="save-section">
        <h2 className="save-section-title">{t('save.local.title')}</h2>
        <p className="save-warning">{t('save.local.warning')}</p>

        <SlotSelect
          id="save-slot-select"
          label={t('save.local.slotLabel')}
          value={selectedSlot}
          onChange={setSelectedSlot}
          slotSummaries={slotSummaries}
          t={t}
          i18n={i18n}
        />

        <div className="save-actions">
          <button type="button" onClick={handleSave}>
            {t('save.local.saveButton', { slot: selectedSlot })}
          </button>
          <button type="button" onClick={handleEnableAutosave}>
            {t('save.local.autosaveEnableButton', { slot: selectedSlot })}
          </button>
          <button
            type="button"
            onClick={handleDisableAutosave}
            disabled={!autosaveOn}
          >
            {t('save.local.autosaveDisableButton')}
          </button>
        </div>

        {autosaveOn && (
          <p className="save-autosave-status">
            {t('save.local.autosaveOn', {
              slot: slotNumberFromId(autosaveSlotId),
            })}
            {countdownMinutes != null && (
              <>
                {' '}
                {t('save.local.autosaveCountdown', {
                  minutes: countdownMinutes,
                })}
              </>
            )}
          </p>
        )}
      </section>

      <section className="save-section">
        <h2 className="save-section-title">{t('save.load.title')}</h2>
        <SlotSelect
          id="load-slot-select"
          label={t('save.load.slotLabel')}
          value={selectedSlot}
          onChange={setSelectedSlot}
          slotSummaries={slotSummaries}
          t={t}
          i18n={i18n}
        />
        <div className="save-actions">
          <button type="button" onClick={handleLoadSlot}>
            {t('save.load.loadButton', { slot: selectedSlot })}
          </button>
        </div>
        <p>
          <button type="button" className="save-restart-button" onClick={handleRestart}>
            {t('save.restart.button')}
          </button>
        </p>
      </section>

      <section className="save-section">
        <h2 className="save-section-title">{t('save.text.title')}</h2>
        <p className="save-text-help">{t('save.text.help')}</p>

        <label className="save-text-label" htmlFor="save-export-text">
          {t('save.text.exportLabel')}
        </label>
        <textarea
          id="save-export-text"
          className="save-textarea"
          rows={6}
          readOnly
          value={exportText}
          placeholder={t('save.text.exportPlaceholder')}
        />
        <div className="save-actions">
          <button type="button" onClick={handleExport}>
            {t('save.text.exportButton')}
          </button>
          <button type="button" onClick={handleCopyExport}>
            {t('save.text.copyButton')}
          </button>
        </div>

        <label className="save-text-label" htmlFor="save-import-text">
          {t('save.text.importLabel')}
        </label>
        <textarea
          id="save-import-text"
          className="save-textarea"
          rows={6}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={t('save.text.importPlaceholder')}
        />
        <p>
          <button type="button" onClick={handleImport}>
            {t('save.text.importButton')}
          </button>
        </p>
      </section>

      {message && <p className="save-message" role="status">{message}</p>}
    </div>
  )
}
