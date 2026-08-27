import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Loader2, RefreshCcw, Search } from 'lucide-react'
import type { Coordinates } from '../utils/nearbyHospitals'

interface LocationPermissionProps {
  onGranted: (coords: Coordinates) => void
  onSkip: () => void
  /** A manually typed city/town/area/PIN code — the §12 fallback for when GPS access isn't available or wanted. */
  onManualSearch: (area: string) => void
}

type Status = 'idle' | 'requesting' | 'denied' | 'unavailable' | 'timeout' | 'unknownError'

/**
 * Never calls navigator.geolocation on mount — only in response to the
 * person tapping "Allow Location," per the requirement that location is
 * requested when the feature is actually used, not on app startup.
 *
 * BUG FIX: the previous version treated every geolocation failure —
 * permission denied, position unavailable, request timeout, anything —
 * as "denied," so a person who granted permission but simply had a slow
 * GPS fix (a TIMEOUT) was told the same "permission not granted" message
 * as someone who'd actually blocked the site. That's not a browser quirk;
 * it's this component ignoring `GeolocationPositionError.code`, which
 * distinguishes exactly these cases. Fixed below by branching on it.
 *
 * Manual area search is offered unconditionally (not only after GPS
 * fails) — someone may simply prefer to type "Coimbatore" rather than
 * grant location at all, and shouldn't have to trigger a failure first.
 */
export default function LocationPermission({ onGranted, onSkip, onManualSearch }: LocationPermissionProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<Status>('idle')
  const [manualArea, setManualArea] = useState('')

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      return
    }
    setStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onGranted({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => {
        // GeolocationPositionError codes: 1 = PERMISSION_DENIED,
        // 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT. Anything else (rare,
        // but some browsers/webviews report 0 or an unexpected value)
        // falls through to a generic retry message rather than being
        // mislabeled as one of the three known cases.
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus('unavailable')
        } else if (err.code === err.TIMEOUT) {
          setStatus('timeout')
        } else {
          setStatus('unknownError')
        }
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false }
    )
  }

  // Permissions API pre-check — not universally supported (notably not on
  // Safari), so every use of it is feature-detected and this component
  // works fine via navigator.geolocation alone when it's absent. Where it
  // IS available, this lets a person who grants access via the browser's
  // own address-bar permission icon (rather than this component's button)
  // get picked up automatically instead of needing to press "Allow
  // Location" a second time.
  useEffect(() => {
    if (!('permissions' in navigator)) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (cancelled) return
        const onChange = () => {
          if (result.state === 'granted' && status !== 'requesting') {
            requestLocation()
          }
        }
        result.addEventListener('change', onChange)
        cleanup = () => result.removeEventListener('change', onChange)
      })
      .catch(() => {
        // Permissions API exists but this particular query isn't
        // supported (some older browsers) — geolocation itself still
        // works, just without this proactive assist.
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const errorMessage: Partial<Record<Status, string>> = {
    denied: t('nearbyCare.locationDenied'),
    unavailable: t('nearbyCare.locationUnavailable'),
    timeout: t('nearbyCare.locationTimeout'),
    unknownError: t('nearbyCare.locationUnknownError')
  }
  const currentError = errorMessage[status]

  const submitManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualArea.trim()) return
    onManualSearch(manualArea.trim())
  }

  return (
    <div className="glass-card p-6 text-center max-w-md mx-auto">
      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blossom-300 to-blossom-500 text-white flex items-center justify-center mx-auto mb-4">
        <MapPin size={20} aria-hidden="true" />
      </div>
      <h3 className="font-display font-semibold text-lg text-ink-900 mb-1.5">
        {t('nearbyCare.locationTitle')}
      </h3>
      <p className="text-sm font-body text-ink-700/75 mb-5">{t('nearbyCare.locationSubtitle')}</p>

      {currentError && (
        <p role="alert" className="text-sm font-friendly text-red-600 bg-red-50 rounded-xl2 p-3 mb-4">
          {currentError}
        </p>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={requestLocation} disabled={status === 'requesting'} className="btn-primary disabled:opacity-60">
          {status === 'requesting' ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> {t('nearbyCare.locating')}
            </>
          ) : currentError ? (
            <>
              <RefreshCcw size={16} aria-hidden="true" /> {t('common.retry')}
            </>
          ) : (
            t('nearbyCare.allowLocation')
          )}
        </button>
        {/* Always available — a person must never be trapped on this
            screen with no way forward if location doesn't work out. */}
        <button onClick={onSkip} className="btn-secondary">
          {t('nearbyCare.notNow')}
        </button>
      </div>

      <div className="flex items-center gap-3 my-5 text-xs font-friendly text-ink-700/40">
        <span className="h-px flex-1 bg-ink-900/10" />
        {t('nearbyCare.orDivider')}
        <span className="h-px flex-1 bg-ink-900/10" />
      </div>

      <form onSubmit={submitManualSearch} className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="manual-area-input" className="sr-only">
          {t('nearbyCare.manualSearchLabel')}
        </label>
        <input
          id="manual-area-input"
          type="text"
          value={manualArea}
          onChange={(e) => setManualArea(e.target.value)}
          placeholder={t('nearbyCare.manualSearchPlaceholder')}
          className="flex-1 rounded-xl2 border-2 border-ink-900/10 px-4 py-2.5 text-sm font-friendly focus:border-blossom-400 focus:outline-none"
        />
        <button type="submit" disabled={!manualArea.trim()} className="btn-secondary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
          <Search size={16} aria-hidden="true" /> {t('nearbyCare.manualSearchSubmit')}
        </button>
      </form>
    </div>
  )
}
