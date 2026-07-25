import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="relative z-10 mt-20 border-t border-blossom-100 bg-white/60 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-ink-700/70 font-body">
        <p>{t('footer.disclaimer')}</p>
        <p className="mt-1">© {new Date().getFullYear()} Kathaipoma · Not a hospital · Not a diagnosis tool</p>
      </div>
    </footer>
  )
}
