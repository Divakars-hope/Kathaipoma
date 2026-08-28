import { useTranslation } from 'react-i18next'

const LANGS: { code: 'en' | 'ta' | 'hi'; short: string; full: string }[] = [
  { code: 'en', short: 'EN', full: 'English' },
  { code: 'ta', short: 'TA', full: 'தமிழ்' },
  { code: 'hi', short: 'HI', full: 'हिन्दी' }
]

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  const setLang = (lng: 'en' | 'ta' | 'hi') => {
    i18n.changeLanguage(lng)
  }

  return (
    <div
      role="group"
      aria-label="Select language"
      className="flex items-center rounded-full bg-white/70 border border-blossom-200 p-1 shadow-soft shrink-0"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={i18n.language === l.code}
          aria-label={l.full}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-display font-semibold transition-colors whitespace-nowrap ${
            i18n.language === l.code
              ? 'bg-blossom-400 text-white'
              : 'text-ink-700 hover:text-blossom-500'
          }`}
        >
          {/* Full language names ("English" / "தமிழ்" / "हिन्दी") together
              don't fit next to the wordmark on a narrow phone screen —
              that was the actual overlap bug. Short codes below the sm:
              breakpoint, full names once there's room. */}
          <span className="sm:hidden">{l.short}</span>
          <span className="hidden sm:inline">{l.full}</span>
        </button>
      ))}
    </div>
  )
}
