import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ConsentGateProps {
  onAgree: () => void
}

export default function ConsentGate({ onAgree }: ConsentGateProps) {
  const { t } = useTranslation()
  const [checked, setChecked] = useState(false)

  return (
    <div className="max-w-xl mx-auto glass-card p-8 my-12">
      <div className="flex items-center gap-2 text-blossom-500 font-display font-semibold text-lg mb-4">
        <ShieldCheck aria-hidden="true" />
        {t('consent.title')}
      </div>
      <ul className="space-y-2 text-sm font-friendly text-ink-700 mb-4">
        <li>🔒 {t('consent.point1')}</li>
        <li>🔒 {t('consent.point2')}</li>
        <li>🔒 {t('consent.point3')}</li>
      </ul>
      <p className="text-xs text-ink-700/70 mb-5">{t('consent.note')}</p>
      <label className="flex items-start gap-3 text-sm font-body text-ink-700 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-4 w-4 accent-blossom-500"
        />
        {t('consent.checkbox')}
      </label>
      <button
        type="button"
        disabled={!checked}
        onClick={onAgree}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('consent.continue')}
      </button>
    </div>
  )
}
