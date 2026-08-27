import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import LanguageToggle from './LanguageToggle'

const ROUTES: { to: string; key: string }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/education', key: 'nav.education' },
  { to: '/nearby-care', key: 'nav.nearbyCare' },
  { to: '/about', key: 'nav.about' },
  { to: '/feedback', key: 'nav.feedback' }
]

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-20">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-blossom-500">
          <img src="/icons/apple-touch-icon.png" alt="Kathaipoma logo" className="h-9 w-9 rounded-full" />
          <span>{t('app.name')}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-body text-sm text-ink-700">
          {ROUTES.map((r) => (
            <Link key={r.to} to={r.to} className="hover:text-blossom-500 transition-colors">
              {t(r.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {/* Mobile-only menu toggle — below md, the inline nav above is
              hidden, so this is the only way to reach About/Feedback (and
              a faster path to Nearby Care) on the platform this product
              is primarily built for. */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className="md:hidden p-2.5 -m-1 text-ink-700 hover:text-blossom-500"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur border-t border-ink-900/5 shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col">
            {ROUTES.map((r) => {
              const active = location.pathname === r.to
              return (
                <Link
                  key={r.to}
                  to={r.to}
                  onClick={() => setMenuOpen(false)}
                  className={`py-3.5 text-base font-friendly border-b border-ink-900/5 last:border-0 ${
                    active ? 'text-blossom-500 font-semibold' : 'text-ink-700'
                  }`}
                >
                  {t(r.key)}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
