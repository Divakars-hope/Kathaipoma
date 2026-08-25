import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle'

export default function Navbar() {
  const { t } = useTranslation()

  return (
    <header className="relative z-20">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-blossom-500">
        <img src="/icons/apple-touch-icon.png" alt="Kathaipoma logo" className="h-9 w-9 rounded-full" />
        <span>{t('app.name')}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-body text-sm text-ink-700">
          <Link to="/" className="hover:text-blossom-500 transition-colors">{t('nav.home')}</Link>
          <Link to="/education" className="hover:text-blossom-500 transition-colors">{t('nav.education')}</Link>
          <Link to="/nearby-care" className="hover:text-blossom-500 transition-colors">{t('nav.nearbyCare')}</Link>
          <Link to="/about" className="hover:text-blossom-500 transition-colors">{t('nav.about')}</Link>
        </nav>
        <LanguageToggle />
      </div>
    </header>
  )
}
