import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function EmergencyWarning() {
  const { t } = useTranslation()
  return (
    <div
      role="alert"
      className="max-w-xl mx-auto rounded-xl2 border-2 border-red-300 bg-red-50 p-6 my-6 text-center"
    >
      <AlertTriangle className="mx-auto text-red-500 mb-2" aria-hidden="true" />
      <p className="font-display font-semibold text-red-700">{t('emergency.title')}</p>
      <p className="text-sm text-red-700/90 mt-1 font-body">{t('emergency.body')}</p>
      <p className="text-xs text-red-600/80 mt-3 font-body">{t('emergency.disclaimer')}</p>
    </div>
  )
}
