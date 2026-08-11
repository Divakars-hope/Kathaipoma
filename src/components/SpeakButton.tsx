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

type Lang = 'en' | 'ta' | 'hi'

const LANG_PREFIX: Record<Lang, string> = { en: 'en', ta: 'ta', hi: 'hi' }
const SPEECH_LOCALE: Record<Lang, string> = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' }

/**
 * Large, thumb-friendly play button. Reads the question/explanation aloud
 * using the browser's built-in SpeechSynthesis API — no server round trip,
 * so it keeps working on a weak rural connection.
 *
 * Cross-browser notes (this is what actually differs between devices):
 * - Chromium browsers (Chrome, Brave, Edge) load their voice list
 *   *asynchronously* — the first call to getVoices() can return an empty
 *   array. We listen for the `voiceschanged` event instead of trusting a
 *   single synchronous read.
 * - Brave specifically strips remote/network voices for privacy, so it
 *   often only has whatever language packs are installed at the OS level.
 *   If Tamil or Hindi isn't one of them, no code fix can conjure a voice
 *   that doesn't exist on the device — the right behavior is to detect
 *   that and fall back to English audio with a visible note, which is
 *   what this component does for *both* Tamil and Hindi (earlier this only
 *   applied to Hindi, which is why Tamil failed silently on Brave/Safari).
 * - Safari (desktop and iOS) also loads voices async and, on top of that,
 *   frequently has zero Tamil/Hindi voices installed unless the person has
 *   downloaded them in system Accessibility settings. Same fallback path
 *   covers it.
 * - Some in-app/embedded browsers (e.g. an app's built-in WebView) don't
 *   implement SpeechSynthesis at all. Previously this component returned
 *   null in that case, so the whole "listen" row silently vanished —
 *   which reads as a missing feature rather than an unsupported one. Now
 *   it stays visible with a short explanation instead of disappearing.
 */
export default function SpeakButton({ textEn, textTa, textHi, className = '' }: SpeakButtonProps) {
  const { t } = useTranslation()
  const [speaking, setSpeaking] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    let cancelled = false

    const loadVoices = () => {
      try {
        const list = window.speechSynthesis.getVoices()
        if (!cancelled && list && list.length) setVoices(list)
      } catch {
        // Some embedded browsers throw here instead of returning an empty
        // array — never let that take down the rest of the page.
      }
    }

    loadVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)

    // Safari and some WebViews may never fire voiceschanged even though
    // voices do load a moment after page load — a couple of retries covers
    // that without needing the event.
    const retry1 = setTimeout(loadVoices, 400)
    const retry2 = setTimeout(loadVoices, 1200)

    return () => {
      cancelled = true
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices)
      clearTimeout(retry1)
      clearTimeout(retry2)
      try {
        window.speechSynthesis.cancel()
      } catch {
        // ignore — nothing to clean up if the API never worked
      }
    }
  }, [supported])

  const hasVoiceFor = (lang: Lang) => {
    // If we were never able to read a voice list at all (rather than
    // reading one that's simply missing this language), don't treat that
    // as "no voice" — let the browser try with its own default rather
    // than forcing every non-English language to silently fall back.
    if (!voices.length) return true
    const prefix = LANG_PREFIX[lang]
    return voices.some((v) => v.lang?.toLowerCase().startsWith(prefix))
  }

  const speak = (lang: Lang) => {
    if (!supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
    setNotice(null)

    let text = textEn
    let speechLang = SPEECH_LOCALE.en

    if (lang !== 'en') {
      const wanted = lang === 'ta' ? textTa : textHi
      if (wanted && hasVoiceFor(lang)) {
        text = wanted
        speechLang = SPEECH_LOCALE[lang]
      } else {
        setNotice(lang === 'ta' ? t('common.voiceFallbackTa') : t('common.voiceFallbackHi'))
      }
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = speechLang
      utterance.rate = 0.95
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeaking(false)
      setNotice(t('common.voiceUnsupported'))
    }
  }

  const stop = () => {
    if (supported) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // ignore
      }
    }
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
