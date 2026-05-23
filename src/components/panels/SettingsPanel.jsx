import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../i18n/languages'
import { getStoredTheme, setStoredLanguage, setStoredTheme } from '../../settings/userPrefs'

export function SettingsPanel() {
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [language, setLanguage] = useState(() => i18n.language)

  function handleThemeChange(nextTheme) {
    setStoredTheme(nextTheme)
    setTheme(nextTheme)
  }

  function handleLanguageChange(nextLanguage) {
    setStoredLanguage(nextLanguage)
    i18n.changeLanguage(nextLanguage)
    setLanguage(nextLanguage)
  }

  return (
    <div className="settings-panel">
      <section className="settings-section">
        <h2 className="settings-section-title">{t('settings.config.title')}</h2>

        <label className="settings-field-label" htmlFor="settings-language-select">
          {t('settings.config.languageLabel')}
        </label>
        <select
          id="settings-language-select"
          className="settings-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {SUPPORTED_LANGUAGES.map(({ code, labelKey }) => (
            <option key={code} value={code}>
              {t(labelKey)}
            </option>
          ))}
        </select>

        <p className="settings-field-label">{t('settings.config.themeLabel')}</p>
        <div className="settings-theme-toggle" role="group" aria-label={t('settings.config.themeLabel')}>
          <button
            type="button"
            className={`settings-theme-btn${theme === 'light' ? ' settings-theme-btn--active' : ''}`}
            title={t('settings.config.themeLightHint')}
            aria-pressed={theme === 'light'}
            onClick={() => handleThemeChange('light')}
          >
            {t('settings.config.themeLightSymbol')}
          </button>
          <button
            type="button"
            className={`settings-theme-btn${theme === 'dark' ? ' settings-theme-btn--active' : ''}`}
            title={t('settings.config.themeDarkHint')}
            aria-pressed={theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
          >
            {t('settings.config.themeDarkSymbol')}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">{t('settings.about.whoTitle')}</h2>
        <p>{t('settings.about.whoDesign')}</p>
        <p>
          <Trans
            i18nKey="settings.about.whoArtists"
            components={{
              link: (
                <a
                  href="https://www.asciiart.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </p>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">{t('settings.about.licenseTitle')}</h2>
        <p>{t('settings.about.licenseCode')}</p>
        <p>
          <Trans
            i18nKey="settings.about.licenseCodeLink"
            components={{
              gpl: (
                <a
                  href="https://www.gnu.org/licenses/gpl-3.0.html"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </p>
        <p>{t('settings.about.licenseArt')}</p>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">{t('settings.about.moreTitle')}</h2>
        <p>{t('settings.about.thankYou')}</p>
        <p>
          <Trans
            i18nKey="settings.about.contact"
            components={{
              email: <a href="mailto:phil.wolframm@gmail.com" />,
            }}
          />
        </p>
      </section>
    </div>
  )
}
