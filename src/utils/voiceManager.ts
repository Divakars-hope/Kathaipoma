export type SpeechLang = 'en' | 'ta' | 'hi'

const LANG_PREFIX: Record<SpeechLang, string> = { en: 'en', ta: 'ta', hi: 'hi' }
const SPEECH_LOCALE: Record<SpeechLang, string> = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' }

/**
 * Reusable Text-to-Speech manager built on the browser's SpeechSynthesis
 * API. Framework-agnostic (no React here) so it's independently testable
 * and reusable anywhere audio playback is needed, not just from
 * SpeakButton. Works identically in a PWA and inside Capacitor's Android
 * WebView — both expose the same standard Web Speech API; the only real
 * variable is whether the *device* has a given language's voice
 * installed, which no amount of code can conjure (see hasVoiceFor).
 *
 * Handles, specifically:
 * 1. Voice detection — isSpeechSupported()
 * 2. Waiting for async voice loading — loadVoices() (event + retries)
 * 3. Selecting the best matching voice — findBestVoice() (exact locale
 *    match first, then language-prefix match, preferring a device-local
 *    voice over a remote/network one for reliability)
 * 4. Explicit language matching — findBestVoice()/speak() set both
 *    utterance.voice AND utterance.lang, since relying on lang alone can
 *    make some browsers silently fall back to a default voice even when
 *    a better match exists in the list
 * 5. Stopping previous speech before starting new — speak()
 * 6. Handling speech errors — onerror callback
 * 7. Async voice exposure — loadVoices()'s voiceschanged listener + retries
 * 8. Graceful fallback indication — hasVoiceFor() lets the caller decide
 *    what to say when a language genuinely isn't available on this device
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * Subscribes to the browser's voice list becoming available and calls
 * `onVoices` whenever it changes (including a couple of timed retries for
 * Safari/WebViews that populate voices without ever firing
 * `voiceschanged`). Returns a cleanup function.
 */
export function loadVoices(onVoices: (voices: SpeechSynthesisVoice[]) => void): () => void {
  if (!isSpeechSupported()) return () => {}
  let cancelled = false

  const read = () => {
    try {
      const list = window.speechSynthesis.getVoices()
      if (!cancelled && list && list.length) onVoices(list)
    } catch {
      // Some embedded browsers throw here instead of returning an empty
      // array — never let that take down the caller.
    }
  }

  read()
  window.speechSynthesis.addEventListener?.('voiceschanged', read)
  const retry1 = setTimeout(read, 400)
  const retry2 = setTimeout(read, 1200)

  return () => {
    cancelled = true
    window.speechSynthesis.removeEventListener?.('voiceschanged', read)
    clearTimeout(retry1)
    clearTimeout(retry2)
  }
}

/**
 * True if we were never able to read a voice list at all (rather than
 * reading one that's simply missing this language) — in that undetermined
 * case, don't treat it as "no voice," let the browser attempt its own
 * default rather than forcing every non-English language to silently
 * fall back before we've actually confirmed anything is missing.
 */
export function hasVoiceFor(voices: SpeechSynthesisVoice[], lang: SpeechLang): boolean {
  if (!voices.length) return true
  const prefix = LANG_PREFIX[lang]
  return voices.some((v) => v.lang?.toLowerCase().startsWith(prefix))
}

/**
 * Picks the single best voice for a language: an exact locale match
 * first (e.g. "ta-IN"), then any voice whose language starts with the
 * right prefix, preferring a device-local voice over a remote/network
 * one (local voices work offline and tend to be more reliably available
 * than network voices, which some browsers — Brave notably — block
 * entirely for privacy).
 */
export function findBestVoice(voices: SpeechSynthesisVoice[], lang: SpeechLang): SpeechSynthesisVoice | undefined {
  const locale = SPEECH_LOCALE[lang].toLowerCase()
  const exact = voices.find((v) => v.lang?.toLowerCase() === locale)
  if (exact) return exact

  const prefix = LANG_PREFIX[lang]
  const candidates = voices.filter((v) => v.lang?.toLowerCase().startsWith(prefix))
  if (!candidates.length) return undefined
  return candidates.find((v) => v.localService) ?? candidates[0]
}

export interface SpeakOptions {
  text: string
  lang: SpeechLang
  voices: SpeechSynthesisVoice[]
  rate?: number
  onEnd?: () => void
  onError?: () => void
}

/**
 * Stops any in-progress speech and starts new speech, with an explicit
 * best-match voice selected (not just a lang string handed to the
 * browser to guess with). Returns false if speech isn't supported or the
 * utterance couldn't be constructed at all — callers should show a
 * fallback message in that case, not silently do nothing.
 */
export function speak({ text, lang, voices, rate = 0.95, onEnd, onError }: SpeakOptions): boolean {
  if (!isSpeechSupported()) return false
  try {
    window.speechSynthesis.cancel()
  } catch {
    // ignore
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    const best = findBestVoice(voices, lang)
    if (best) utterance.voice = best
    utterance.lang = best?.lang ?? SPEECH_LOCALE[lang]
    utterance.rate = rate
    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onError?.()
    window.speechSynthesis.speak(utterance)
    return true
  } catch {
    onError?.()
    return false
  }
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // ignore — nothing to clean up if the API never worked
  }
}
