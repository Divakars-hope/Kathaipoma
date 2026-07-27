/**
 * Small shared helper for the handful of places that store bilingual/
 * trilingual content directly on data objects (questions, recommendations,
 * education topics) rather than in the i18n JSON files — see README
 * "Editing the question bank" for why that split exists.
 *
 * Centralizing the selection logic here means every page picks a language
 * the same way, and adding a language later only ever touches this one
 * function plus the data itself.
 */
export type AppLanguage = 'en' | 'ta' | 'hi'

export function currentAppLanguage(i18nLanguage: string): AppLanguage {
  if (i18nLanguage === 'ta') return 'ta'
  if (i18nLanguage === 'hi') return 'hi'
  return 'en'
}

/**
 * Picks the matching field for the current language, falling back to the
 * English value if a Hindi/Tamil field is missing or empty (keeps this
 * forward-compatible for any content that hasn't been translated yet).
 */
export function pickLang(lang: AppLanguage, en: string, ta: string, hi?: string): string {
  if (lang === 'ta') return ta || en
  if (lang === 'hi') return hi || en
  return en
}
