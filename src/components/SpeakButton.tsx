import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { hasVoiceFor, isSpeechSupported, loadVoices, speak as speakVoice, stopSpeaking, type SpeechLang } from '../utils/voiceManager'

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
 * using the browser's built-in SpeechSynthesis API via utils/voiceManager —
 * no server round trip, so it keeps working on a weak rural connection.
 *
 * This component used to set only `utterance.lang` and let the browser
 * pick a voice on its own. That's the actual root cause behind Tamil/Hindi
 * sometimes not working even on devices that DO have the right voice
 * installed: some browsers don't reliably resolve a `lang` string to the
 * best matching voice by themselves. voiceManager.findBestVoice() resolves
 * the voice explicitly (exact locale match, then language-prefix match,
 * preferring a local over a remote voice) and this component sets
 * `utterance.voice` directly — see voiceManager.ts for the full writeup.
 *
 * Cross-browser notes that still apply regardless of that fix:
 * - Voice lists load asynchronously in most browsers — voiceManager's
 *   loadVoices() handles the `voiceschanged` event plus timed retries for
 *   Safari/WebViews that never fire it.
 * - Brave strips remote/network voices for privacy; Safari frequently has
 *   zero Tamil/Hindi voices installed unless downloaded in system
 *   settings. Neither is fixable in code — hasVoiceFor() lets this
 *   component detect that and fall back to English audio with a visible
 *   note instead of silently doing nothing.
 * - Some in-app/embedded browsers don't implement SpeechSynthesis at all —
 *   this component stays visible with a plain explanation rather than
 *   vanishing, so the feature reads as "unsupported here" rather than
 *   "missing."
 */
export default function SpeakButton({ textEn, textTa, textHi, className = '' }: SpeakButtonProps) {
  const { t } = useTranslation()
  const [speaking, setSpeaking] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const supported = isSpeechSupported()

  useEffect(() => {
    if (!supported) return
    const unsubscribe = loadVoices(setVoices)
    return () => {
      unsubscribe()
      stopSpeaking()
    }
  }, [supported])

  const speak = (lang: SpeechLang) => {
    if (!supported) return
    setNotice(null)

    let text = textEn
    let effectiveLang: SpeechLang = 'en'

    if (lang !== 'en') {
      const wanted = lang === 'ta' ? textTa : textHi
      if (wanted && hasVoiceFor(voices, lang)) {
        text = wanted
        effectiveLang = lang
      } else {
        setNotice(lang === 'ta' ? t('common.voiceFallbackTa') : t('common.voiceFallbackHi'))
      }
    }

    const ok = speakVoice({
      text,
      lang: effectiveLang,
      voices,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    })
    if (ok) {
      setSpeaking(true)
    } else {
      setSpeaking(false)
      setNotice(t('common.voiceUnsupported'))
    }
  }

  const stop = () => {
    stopSpeaking()
    setSpeaking(false)
  }

  if (!supported) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-friendly text-ink-700/50 ${className}`}>
        <VolumeX size={14} aria-hidden="true" /> {t('common.voiceUnsupported')}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
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
            aria-label={t('common.listenHindi')}
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
      {notice && (
        <p className="mt-1.5 text-xs font-friendly text-ink-700/60" role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </div>
  )
}
