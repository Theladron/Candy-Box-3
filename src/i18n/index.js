import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getStoredLanguage } from '../settings/userPrefs'
import { resolveLanguage } from './languages'
import en from './locales/en.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: resolveLanguage(getStoredLanguage()),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
