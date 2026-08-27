import { useTranslation } from 'react-i18next'
import { ShieldCheck, EyeOff, Ban } from 'lucide-react'
import BackButton from '../components/BackButton'

export default function About() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <BackButton className="mb-6" />

      <h1 className="font-display font-bold text-2xl text-ink-900 mb-8 text-center">
        {t('about.title')}
      </h1>

      <div className="space-y-5">
        <div className="glass-card p-6 flex gap-4">
          <ShieldCheck className="text-blossom-500 shrink-0" aria-hidden="true" />
          <p className="text-sm font-friendly text-ink-700 leading-relaxed">{t('about.body1')}</p>
        </div>
        <div className="glass-card p-6 flex gap-4">
          <EyeOff className="text-blossom-500 shrink-0" aria-hidden="true" />
          <p className="text-sm font-friendly text-ink-700 leading-relaxed">{t('about.body2')}</p>
        </div>
        <div className="glass-card p-6 flex gap-4">
          <Ban className="text-blossom-500 shrink-0" aria-hidden="true" />
          <p className="text-sm font-friendly text-ink-700 leading-relaxed">{t('about.body3')}</p>
        </div>
      </div>

      <p className="text-xs text-ink-700/60 font-body text-center mt-10">
        {t('footer.disclaimer')}
      </p>
    </div>
  )
}
