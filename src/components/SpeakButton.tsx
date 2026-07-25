import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SpeakButtonProps {
  /** Text to read aloud in English */
  textEn: string
  /** Text to read aloud in Tamil */
  textTa: string
  className?: string
}

/**
 * Large, thumb-friendly play button. Reads the question/explanation aloud
 * using the browser's built-in SpeechSynthesis API — no server round trip,
 * so it keeps working on a weak rural connection.
 */
export default function SpeakButton({ textEn, textTa, className = '' }: SpeakButtonProps) {
  const { i18n, t } = useTranslation()
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  const speak = (lang: 'en' | 'ta') => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const text = lang === 'ta' ? textTa : textEn
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  if (!supported) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => speak('en')}
        aria-label={t('common.listenEnglish')}
        className="flex items-center gap-1.5 rounded-full bg-lavender-100 hover:bg-lavender-200 text-ink-700 px-3.5 py-2 text-sm font-friendly font-semibold transition-colors"
      >
        <Volume2 size={16} aria-hidden="true" /> EN
      </button>
      <button
        type="button"
        onClick={() => speak('ta')}
        aria-label={t('common.listenTamil')}
        className="flex items-center gap-1.5 rounded-full bg-blossom-100 hover:bg-blossom-200 text-blossom-600 px-3.5 py-2 text-sm font-friendly font-semibold transition-colors"
      >
        <Volume2 size={16} aria-hidden="true" /> தமிழ்
      </button>
      {speaking && (
        <button
          type="button"
          onClick={stop}
          aria-label={t('common.stop')}
          className="flex items-center gap-1.5 rounded-full bg-ink-900/5 hover:bg-ink-900/10 text-ink-700 px-3.5 py-2 text-sm font-friendly font-semibold transition-colors"
        >
          <VolumeX size={16} aria-hidden="true" /> {t('common.stop')}
        </button>
      )}
    </div>
  )
}
