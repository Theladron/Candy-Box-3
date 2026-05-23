export const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'settings.config.languages.en' },
]

export function isSupportedLanguage(code) {
  return SUPPORTED_LANGUAGES.some((language) => language.code === code)
}

export function resolveLanguage(code) {
  return isSupportedLanguage(code) ? code : 'en'
}
