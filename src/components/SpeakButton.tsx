import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SpeakButtonProps {
  /** Text to read aloud in English */
  textEn: string
  /** Text to read aloud in Tamil */
  textTa: string
  /** Text to read aloud in Hindi (optional — falls back to English audio if omitted or if no Hindi voice is available on the device) */
  textHi?: string
  className?: string
}

/**
 * Large, thumb-friendly play button. Reads the question/explanation aloud
 * using the browser's built-in SpeechSynthesis API — no server round trip,
 * so it keeps working on a weak rural connection.
 */
export default function SpeakButton({ textEn, textTa, textHi, className = '' }: SpeakButtonProps) {
  const { i18n, t } = useTranslation()
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  const hasVoiceFor = (langPrefix: string) => {
    if (!supported) return false
    try {
      const voices = window.speechSynthesis.getVoices()
      return voices.some((v) => v.lang.toLowerCase().startsWith(langPrefix))
    } catch {
      // If the voice list can't be read, don't block speech — let the
      // browser attempt it with its default voice instead of failing.
      return true
    }
  }

  const speak = (lang: 'en' | 'ta' | 'hi') => {
    if (!supported) return
    window.speechSynthesis.cancel()

    let text = textEn
    let speechLang = 'en-IN'

    if (lang === 'ta') {
      text = textTa
      speechLang = 'ta-IN'
    } else if (lang === 'hi') {
      // Gracefully fall back to English audio if there's no Hindi text
      // provided yet, or no Hindi voice installed on this device — never
      // let a missing Hindi voice break the app or go silent unexplained.
      if (textHi && hasVoiceFor('hi')) {
        text = textHi
        speechLang = 'hi-IN'
      } else {
        text = textEn
        speechLang = 'en-IN'
      }
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLang
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
      {textHi && (
        <button
          type="button"
          onClick={() => speak('hi')}
          aria-label="हिन्दी में सुनें"
          className="flex items-center gap-1.5 rounded-full bg-lavender-100 hover:bg-lavender-200 text-ink-700 px-3.5 py-2 text-sm font-friendly font-semibold transition-colors"
        >
          <Volume2 size={16} aria-hidden="true" /> हिन्दी
        </button>
      )}
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
