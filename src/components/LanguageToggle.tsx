import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  const setLang = (lng: 'en' | 'ta') => {
    i18n.changeLanguage(lng)
  }

  return (
    <div
      role="group"
      aria-label="Select language"
      className="flex items-center rounded-full bg-white/70 border border-blossom-200 p-1 shadow-soft"
    >
      <button
        onClick={() => setLang('en')}
        aria-pressed={i18n.language === 'en'}
        className={`px-3 py-1.5 rounded-full text-sm font-display font-semibold transition-colors ${
          i18n.language === 'en'
            ? 'bg-blossom-400 text-white'
            : 'text-ink-700 hover:text-blossom-500'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLang('ta')}
        aria-pressed={i18n.language === 'ta'}
        className={`px-3 py-1.5 rounded-full text-sm font-display font-semibold transition-colors ${
          i18n.language === 'ta'
            ? 'bg-blossom-400 text-white'
            : 'text-ink-700 hover:text-blossom-500'
        }`}
      >
        தமிழ்
      </button>
    </div>
  )
}
