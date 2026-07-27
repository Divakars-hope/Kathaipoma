import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Check } from 'lucide-react'

/**
 * Anonymous, localStorage-only feedback widget shown at the bottom of the
 * Results page. Independent of the Firebase-backed /feedback page — this
 * one has no backend, no network call, and no PII: it only ever writes to
 * the visiting browser's own localStorage, keyed per screening module, so
 * a submitted rating/comment survives a page refresh on that same device.
 */

const STORAGE_KEY = 'kathaipoma_results_feedback_v1'

interface StoredFeedback {
  rating: number
  message: string
  submittedAt: string
}

type FeedbackStore = Record<string, StoredFeedback>

function readStore(): FeedbackStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FeedbackStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: FeedbackStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.) —
    // fail silently, the rest of the app is unaffected.
  }
}

const COPY = {
  en: {
    title: 'Rate this screening',
    subtitle: 'Optional and anonymous — helps us improve.',
    placeholder: 'Anything you want to share? (optional)',
    submit: 'Submit feedback',
    thanks: 'Thank you for your feedback.',
    yourRating: 'Your rating:',
    edit: 'Edit'
  },
  ta: {
    title: 'இந்த பரிசோதனையை மதிப்பிடுங்கள்',
    subtitle: 'விருப்பமானது மற்றும் அநாமதேயமானது — மேம்படுத்த உதவுகிறது.',
    placeholder: 'நீங்கள் பகிர விரும்புவது ஏதேனும் உள்ளதா? (விருப்பம்)',
    submit: 'கருத்தை சமர்ப்பிக்கவும்',
    thanks: 'உங்கள் கருத்துக்கு நன்றி.',
    yourRating: 'உங்கள் மதிப்பீடு:',
    edit: 'திருத்து'
  }
}

export default function ResultsFeedback({ moduleId }: { moduleId: string }) {
  const { i18n } = useTranslation()
  const isTa = i18n.language === 'ta'
  const c = isTa ? COPY.ta : COPY.en

  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [saved, setSaved] = useState<StoredFeedback | null>(null)
  const [editing, setEditing] = useState(false)

  // Load any existing feedback for this module from localStorage on mount
  // (and whenever the module changes), so a refresh shows what was
  // previously submitted on this browser.
  useEffect(() => {
    const store = readStore()
    const existing = store[moduleId]
    if (existing) {
      setSaved(existing)
      setRating(existing.rating)
      setMessage(existing.message)
      setEditing(false)
    } else {
      setSaved(null)
      setRating(0)
      setMessage('')
      setEditing(true)
    }
  }, [moduleId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    const entry: StoredFeedback = {
      rating,
      message: message.trim(),
      submittedAt: new Date().toISOString()
    }
    const store = readStore()
    store[moduleId] = entry
    writeStore(store)
    setSaved(entry)
    setEditing(false)
  }

  const showForm = editing || !saved

  return (
    <div className="glass-card p-6 mt-6">
      <h2 className="font-display font-semibold text-ink-900 mb-1">{c.title}</h2>
      <p className="text-xs font-body text-ink-700/60 mb-4">{c.subtitle}</p>

      {!showForm && saved ? (
        <div>
          <div className="flex items-center gap-2 text-sm font-friendly text-green-600 mb-2">
            <Check size={16} aria-hidden="true" /> {c.thanks}
          </div>
          <div className="flex items-center gap-1 mb-2" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={20}
                className={n <= saved.rating ? 'fill-blossom-400 text-blossom-400' : 'text-ink-900/15'}
              />
            ))}
          </div>
          {saved.message && (
            <p className="text-sm font-body text-ink-700/80 italic mb-3">"{saved.message}"</p>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-friendly text-blossom-500 hover:text-blossom-600 underline"
          >
            {c.edit}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-1 mb-4" role="radiogroup" aria-label={c.yourRating}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star`}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  size={26}
                  className={rating >= n ? 'fill-blossom-400 text-blossom-400' : 'text-ink-900/20'}
                />
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={c.placeholder}
            className="w-full rounded-xl2 border-2 border-ink-900/10 px-4 py-3 font-body text-sm text-ink-700 bg-white resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blossom-500 mb-4"
          />

          <button
            type="submit"
            disabled={rating === 0}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {c.submit}
          </button>
        </form>
      )}
    </div>
  )
}
