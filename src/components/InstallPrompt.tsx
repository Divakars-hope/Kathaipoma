import { useTranslation } from 'react-i18next'
import { Download, Share, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

interface InstallPromptProps {
  variant?: 'card' | 'compact'
  className?: string
}

/**
 * Renders nothing at all unless the browser genuinely supports install
 * (canInstall) or this is iOS Safari, where installing is possible but
 * only via manual "Add to Home Screen" guidance.
 *
 * By explicit product decision this has no close/× control — it's
 * permanent for as long as the platform reports the app as installable,
 * and disappears on its own only once the app is actually installed
 * (useInstallPrompt detects standalone display mode).
 */
export default function InstallPrompt({ variant = 'card', className = '' }: InstallPromptProps) {
  const { t } = useTranslation()
  const { canInstall, showIOSGuidance, shouldRender, promptInstall } = useInstallPrompt()

  if (!shouldRender) return null

  if (variant === 'compact') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-center justify-between gap-3 rounded-xl2 bg-blossom-50 border border-blossom-200 px-4 py-3 ${className}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={18} className="text-blossom-500 shrink-0" aria-hidden="true" />
            <p className="text-sm font-friendly text-ink-700 truncate">
              {t('installPrompt.compactMessage')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canInstall ? (
              <button onClick={promptInstall} className="text-sm font-friendly font-semibold text-blossom-600 hover:text-blossom-700">
                {t('installPrompt.cta')}
              </button>
            ) : (
              <span className="text-xs font-friendly text-blossom-600">{t('installPrompt.iosHint')}</span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`relative glass-card p-6 md:p-7 overflow-hidden ${className}`}
      >
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blossom-300 to-blossom-500 text-white flex items-center justify-center mb-4">
          <Download size={20} aria-hidden="true" />
        </div>

        <h3 className="font-display font-semibold text-lg text-ink-900 mb-1.5">
          {t('installPrompt.title')}
        </h3>
        <p className="text-sm font-body text-ink-700/75 leading-relaxed mb-5 max-w-md">
          {t('installPrompt.subtitle')}
        </p>

        {canInstall && (
          <button onClick={promptInstall} className="btn-primary">
            <Download size={16} aria-hidden="true" /> {t('installPrompt.cta')}
          </button>
        )}

        {showIOSGuidance && (
          <div className="flex items-center gap-2 text-sm font-friendly text-ink-700 bg-white/70 rounded-xl2 px-4 py-3 max-w-md">
            <Share size={16} className="text-blossom-500 shrink-0" aria-hidden="true" />
            {t('installPrompt.iosInstructions')}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
