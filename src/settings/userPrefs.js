const STORAGE_PREFIX = 'candybox3'
const THEME_KEY = `${STORAGE_PREFIX}.theme`
const LANGUAGE_KEY = `${STORAGE_PREFIX}.language`

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light')
  applyTheme(theme)
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('inverted', theme === 'dark')
}

export function applyStoredTheme() {
  applyTheme(getStoredTheme())
}

export function getStoredLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'en'
}

export function setStoredLanguage(languageCode) {
  localStorage.setItem(LANGUAGE_KEY, languageCode)
}
