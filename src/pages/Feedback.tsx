import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, AlertTriangle } from 'lucide-react'
import { MODULE_LIST, MODULES } from '../data/questions'
import { submitFeedback, feedbackBackendConfigured } from '../utils/feedbackService'
import BackButton from '../components/BackButton'
import { currentAppLanguage, pickLang } from '../utils/localize'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Feedback() {
  const { t, i18n } = useTranslation()
  const lang = currentAppLanguage(i18n.language)

  const [message, setMessage] = useState('')
  const [moduleContext, setModuleContext] = useState('general')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const configured = feedbackBackendConfigured()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('sending')
    setErrorMsg('')
    try {
      await submitFeedback({
        message: message.trim(),
        moduleContext,
        language: lang
      })
      setStatus('sent')
      setMessage('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <BackButton className="mb-6" />

      <h1 className="font-display font-bold text-2xl text-ink-900 mb-2 text-center">
        {t('feedback.title')}
      </h1>
      <p className="text-sm font-body text-ink-700/75 text-center mb-8">
        {t('feedback.subtitle')}
      </p>

      {!configured && (
        <div className="rounded-xl2 border-2 border-amber-200 bg-amber-50 p-4 mb-6 flex gap-3 text-sm font-friendly text-amber-800">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('feedback.notConfigured')}</span>
        </div>
      )}

      {status === 'sent' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={36} aria-hidden="true" />
          <p className="font-display font-semibold text-ink-900">{t('feedback.thanks')}</p>
          <button className="btn-secondary mt-6" onClick={() => setStatus('idle')}>
            {t('feedback.sendAnother')}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-7 space-y-6">
          <div>
            <label htmlFor="moduleContext" className="font-display font-semibold text-ink-900 text-sm block mb-2">
              {t('feedback.aboutLabel')}
            </label>
            <select
              id="moduleContext"
              value={moduleContext}
              onChange={(e) => setModuleContext(e.target.value)}
              className="w-full rounded-xl2 border-2 border-ink-900/10 px-4 py-3 font-friendly text-ink-700 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blossom-500"
            >
              <option value="general">{t('feedback.aboutGeneral')}</option>
              {MODULE_LIST.map((id) => (
                <option key={id} value={id}>
                  {pickLang(lang, MODULES[id].titleEn, MODULES[id].titleTa, MODULES[id].titleHi)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feedbackMessage" className="font-display font-semibold text-ink-900 text-sm block mb-2">
              {t('feedback.messageLabel')}
            </label>
            <textarea
              id="feedbackMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
              required
              placeholder={t('feedback.messagePlaceholder') ?? ''}
              className="w-full rounded-xl2 border-2 border-ink-900/10 px-4 py-3 font-body text-ink-700 bg-white resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blossom-500"
            />
          </div>

          <p className="text-xs text-ink-700/60 font-body">{t('feedback.anonymousNote')}</p>

          {status === 'error' && (
            <p role="alert" className="text-sm font-friendly text-red-600 bg-red-50 rounded-xl2 p-3">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={!message.trim() || status === 'sending'}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} aria-hidden="true" />
            {status === 'sending' ? t('feedback.sending') : t('feedback.submit')}
          </button>
        </form>
      )}
    </div>
  )
}
