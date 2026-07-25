import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SpeakButton from './SpeakButton'

/**
 * Small, dismissible floating assistant. It never blocks content and never
 * auto-opens more than once per visit — the goal is reassurance, not nagging.
 */
export default function AIAssistant() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-30">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-card mb-3 w-72 p-5"
            role="dialog"
            aria-label={t('assistant.name')}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-display font-semibold text-blossom-500">
                <Sparkles size={18} aria-hidden="true" />
                {t('assistant.name')}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('assistant.close')}
                className="text-ink-700/60 hover:text-ink-900"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-sm font-friendly text-ink-700 leading-relaxed">
              {t('assistant.greeting')}
            </p>
            <SpeakButton
              className="mt-4"
              textEn="Hello, I'm Kathaipoma AI. I'm here to explain every question in simple words. You can also listen instead of reading."
              textTa="வணக்கம், நான் கதைபோமா AI. ஒவ்வொரு கேள்வியையும் எளிய வார்த்தைகளில் விளக்க இங்கே இருக்கிறேன்."
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t('assistant.name')}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-blossom-400 to-blossom-500 text-white shadow-glass flex items-center justify-center animate-pulseSoft"
      >
        <Sparkles size={22} aria-hidden="true" />
      </motion.button>
    </div>
  )
}
