import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Loader2 } from 'lucide-react'
import type { Coordinates } from '../utils/nearbyHospitals'

interface LocationPermissionProps {
  onGranted: (coords: Coordinates) => void
  onSkip: () => void
}

type Status = 'idle' | 'requesting' | 'denied' | 'unavailable'

/**
 * Never calls navigator.geolocation on mount — only in response to the
 * person tapping "Allow Location," per the requirement that location is
 * requested when the feature is actually used, not on app startup.
 */
export default function LocationPermission({ onGranted, onSkip }: LocationPermissionProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<Status>('idle')

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
      () => {
        setStatus('denied')
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )
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

      {status === 'denied' && (
        <p role="alert" className="text-sm font-friendly text-red-600 bg-red-50 rounded-xl2 p-3 mb-4">
          {t('nearbyCare.locationDenied')}
        </p>
      )}
      {status === 'unavailable' && (
        <p role="alert" className="text-sm font-friendly text-red-600 bg-red-50 rounded-xl2 p-3 mb-4">
          {t('nearbyCare.locationUnavailable')}
        </p>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={requestLocation} disabled={status === 'requesting'} className="btn-primary disabled:opacity-60">
          {status === 'requesting' ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> {t('nearbyCare.locating')}
            </>
          ) : (
            t('nearbyCare.allowLocation')
          )}
        </button>
        <button onClick={onSkip} className="btn-secondary">
          {t('nearbyCare.notNow')}
        </button>
      </div>
    </div>
  )
}
