import { initialState } from './initialState'

export const SAVE_VERSION = 1
export const SLOT_IDS = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5']
export const STORAGE_PREFIX = 'candybox3'
export const AUTOSAVE_INTERVAL_MS = 600_000

const NON_PERSISTENT_KEYS = ['merchantHatMessageIndex']

const AUTOSAVE_ENABLED_KEY = `${STORAGE_PREFIX}.autosaveEnabled`
const AUTOSAVE_SLOT_KEY = `${STORAGE_PREFIX}.autosaveSlot`
const LAST_AUTOSAVE_AT_KEY = `${STORAGE_PREFIX}.lastAutosaveAt`

export function getSlotStorageKey(slotId) {
  return `${STORAGE_PREFIX}.${slotId}`
}

function pickPersistableState(state) {
  const result = {}
  for (const key of Object.keys(initialState)) {
    if (!NON_PERSISTENT_KEYS.includes(key)) {
      result[key] = state[key]
    }
  }
  return result
}

function validateGameplayState(state) {
  if (!state || typeof state !== 'object') {
    return false
  }
  if (typeof state.candies !== 'number' || !Number.isFinite(state.candies)) {
    return false
  }
  if (!state.equipment || typeof state.equipment !== 'object') {
    return false
  }
  return true
}

function normalizeLoadedState(partial) {
  return {
    ...initialState,
    ...partial,
    equipment: {
      ...initialState.equipment,
      ...(partial.equipment || {}),
    },
    merchantHatMessageIndex: null,
  }
}

function migrateFromVersion(version, payload) {
  if (version === 0) {
    return {
      ...payload,
      saveVersion: 1,
      state: payload.state ?? payload,
    }
  }
  return payload
}

function runMigrations(payload) {
  let migrated = { ...payload }
  let version =
    typeof migrated.saveVersion === 'number' ? migrated.saveVersion : 0
  migrated.saveVersion = version

  while (migrated.saveVersion < SAVE_VERSION) {
    migrated = migrateFromVersion(migrated.saveVersion, migrated)
    migrated.saveVersion += 1
  }

  return migrated
}

export function serializeState(state) {
  return {
    saveVersion: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state: pickPersistableState(state),
  }
}

export function deserializeState(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'invalid_payload' }
  }

  const migrated = runMigrations(payload)
  const gameplay = migrated.state

  if (!validateGameplayState(gameplay)) {
    return { ok: false, error: 'invalid_state' }
  }

  return { ok: true, state: normalizeLoadedState(gameplay) }
}

export function getSlotSummary(slotId) {
  if (!SLOT_IDS.includes(slotId)) {
    return { empty: true, savedAt: null, candies: null }
  }

  const raw = localStorage.getItem(getSlotStorageKey(slotId))
  if (!raw) {
    return { empty: true, savedAt: null, candies: null }
  }

  try {
    const payload = JSON.parse(raw)
    const result = deserializeState(payload)
    if (!result.ok) {
      return { empty: true, savedAt: null, candies: null }
    }
    return {
      empty: false,
      savedAt: payload.savedAt ?? null,
      candies: result.state.candies,
    }
  } catch {
    return { empty: true, savedAt: null, candies: null }
  }
}

export function saveToSlot(slotId, state) {
  if (!SLOT_IDS.includes(slotId)) {
    return { ok: false, error: 'invalid_slot' }
  }

  try {
    const payload = serializeState(state)
    localStorage.setItem(getSlotStorageKey(slotId), JSON.stringify(payload))
    return { ok: true }
  } catch (err) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      return { ok: false, error: 'quota_exceeded' }
    }
    return { ok: false, error: 'save_failed' }
  }
}

export function loadFromSlot(slotId) {
  if (!SLOT_IDS.includes(slotId)) {
    return { ok: false, error: 'invalid_slot' }
  }

  const raw = localStorage.getItem(getSlotStorageKey(slotId))
  if (!raw) {
    return { ok: false, error: 'empty_slot' }
  }

  try {
    const payload = JSON.parse(raw)
    const result = deserializeState(payload)
    if (!result.ok) {
      return { ok: false, error: result.error }
    }
    return { ok: true, state: result.state }
  } catch {
    return { ok: false, error: 'corrupt_save' }
  }
}

export function deleteSlot(slotId) {
  if (!SLOT_IDS.includes(slotId)) {
    return { ok: false, error: 'invalid_slot' }
  }

  try {
    localStorage.removeItem(getSlotStorageKey(slotId))
    return { ok: true }
  } catch {
    return { ok: false, error: 'delete_failed' }
  }
}

export function exportSaveText(state) {
  return JSON.stringify(serializeState(state), null, 2)
}

export function importSaveText(text) {
  if (!text || !String(text).trim()) {
    return { ok: false, error: 'empty_text' }
  }

  try {
    const payload = JSON.parse(text)
    const result = deserializeState(payload)
    if (!result.ok) {
      return { ok: false, error: result.error }
    }
    return { ok: true, state: result.state }
  } catch {
    return { ok: false, error: 'corrupt_save' }
  }
}

export function getAutosaveEnabled() {
  return localStorage.getItem(AUTOSAVE_ENABLED_KEY) === 'true'
}

export function setAutosaveEnabled(enabled) {
  localStorage.setItem(AUTOSAVE_ENABLED_KEY, enabled ? 'true' : 'false')
}

export function getAutosaveSlot() {
  const slot = localStorage.getItem(AUTOSAVE_SLOT_KEY)
  return SLOT_IDS.includes(slot) ? slot : 'slot1'
}

export function setAutosaveSlot(slotId) {
  if (SLOT_IDS.includes(slotId)) {
    localStorage.setItem(AUTOSAVE_SLOT_KEY, slotId)
  }
}

export function getLastAutosaveAt() {
  return localStorage.getItem(LAST_AUTOSAVE_AT_KEY)
}

export function setLastAutosaveAt(isoString) {
  localStorage.setItem(LAST_AUTOSAVE_AT_KEY, isoString)
}

export function getUrlSlotNumber() {
  if (typeof window === 'undefined') {
    return null
  }
  const slotParam = new URLSearchParams(window.location.search).get('slot')
  if (!slotParam) {
    return null
  }
  const slotNumber = parseInt(slotParam, 10)
  if (!Number.isFinite(slotNumber) || slotNumber < 1 || slotNumber > 5) {
    return null
  }
  return slotNumber
}

export function slotIdFromNumber(slotNumber) {
  return `slot${slotNumber}`
}

export function setUrlSlotNumber(slotNumber) {
  if (typeof window === 'undefined') {
    return
  }
  const url = new URL(window.location.href)
  if (slotNumber >= 1 && slotNumber <= 5) {
    url.searchParams.set('slot', String(slotNumber))
  } else {
    url.searchParams.delete('slot')
  }
  window.history.replaceState(null, '', url.toString())
}

export function getAutosaveCountdownMs() {
  if (!getAutosaveEnabled()) {
    return null
  }
  const lastAt = getLastAutosaveAt()
  if (!lastAt) {
    return AUTOSAVE_INTERVAL_MS
  }
  const elapsed = Date.now() - new Date(lastAt).getTime()
  return Math.max(0, AUTOSAVE_INTERVAL_MS - elapsed)
}
