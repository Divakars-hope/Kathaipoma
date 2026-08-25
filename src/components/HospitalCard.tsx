import { useTranslation } from 'react-i18next'
import { MapPin, Navigation, Phone } from 'lucide-react'
import type { HealthcareFacility } from '../utils/nearbyHospitals'

/** Maps a subset of Google's own verified place `types` to a readable label — never invents a claim beyond what Google itself reports. */
const TYPE_LABEL_KEYS: Record<string, string> = {
  gynecologist: 'nearbyCare.typeGynecology',
  obstetrician: 'nearbyCare.typeObGyn',
  endocrinologist: 'nearbyCare.typeEndocrinology',
  oncologist: 'nearbyCare.typeOncology',
  hospital: 'nearbyCare.typeHospital'
}

export default function HospitalCard({ facility }: { facility: HealthcareFacility }) {
  const { t } = useTranslation()
  const knownTypes = facility.types.filter((ty) => ty in TYPE_LABEL_KEYS)

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-ink-900">{facility.name}</h3>
      {facility.address && (
        <p className="text-sm font-body text-ink-700/70 mt-1 flex items-start gap-1.5">
          <MapPin size={14} className="shrink-0 mt-0.5" aria-hidden="true" /> {facility.address}
        </p>
      )}
      {knownTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {knownTypes.map((ty) => (
            <span key={ty} className="text-xs font-friendly bg-blossom-50 text-blossom-600 rounded-full px-2.5 py-1">
              {t(TYPE_LABEL_KEYS[ty])}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-4">
        <a href={facility.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2 px-3.5">
          <Navigation size={14} aria-hidden="true" /> {t('nearbyCare.directions')}
        </a>
        {facility.phone && (
          <a href={`tel:${facility.phone}`} className="btn-secondary text-sm py-2 px-3.5">
            <Phone size={14} aria-hidden="true" /> {t('nearbyCare.call')}
          </a>
        )}
      </div>
    </div>
  )
}
