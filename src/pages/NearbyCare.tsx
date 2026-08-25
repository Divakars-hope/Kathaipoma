import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, RefreshCcw, Stethoscope, Ribbon } from 'lucide-react'
import LocationPermission from '../components/LocationPermission'
import HospitalCard from '../components/HospitalCard'
import {
  buildMapsSearchUrl,
  concernSearchQuery,
  hospitalSearchEnhancedConfigured,
  searchNearbyHospitals,
  type Coordinates,
  type HealthConcern,
  type HealthcareFacility
} from '../utils/nearbyHospitals'

type Stage = 'chooseConcern' | 'location' | 'loading' | 'results' | 'error'

export default function NearbyCare() {
  const { concern: concernParam } = useParams<{ concern?: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const initialConcern: HealthConcern | null =
    concernParam === 'pcos' || concernParam === 'breast' ? concernParam : null

  const [concern, setConcern] = useState<HealthConcern | null>(initialConcern)
  const [stage, setStage] = useState<Stage>(initialConcern ? 'location' : 'chooseConcern')
  const [coords, setCoords] = useState<Coordinates | undefined>(undefined)
  const [facilities, setFacilities] = useState<HealthcareFacility[] | null>(null)

  const enhanced = hospitalSearchEnhancedConfigured()

  const chooseConcern = (c: HealthConcern) => {
    setConcern(c)
    setStage('location')
  }

  const runSearch = async (loc?: Coordinates) => {
    if (!concern) return
    setCoords(loc)
    if (!enhanced) {
      // Fallback tier: no API key configured, so there's nothing to fetch —
      // the "results" stage just shows the Maps-search link, built below.
      setStage('results')
      setFacilities(null)
      return
    }
    setStage('loading')
    try {
      const results = loc ? await searchNearbyHospitals(concern, loc) : []
      setFacilities(results)
      setStage('results')
    } catch {
      setStage('error')
    }
  }

  useEffect(() => {
    if (initialConcern) setStage('location')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!concern || stage === 'chooseConcern') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display font-bold text-2xl text-ink-900 text-center mb-2">
          {t('nearbyCare.title')}
        </h1>
        <p className="text-sm font-body text-ink-700/70 text-center mb-8">{t('nearbyCare.chooseSubtitle')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => chooseConcern('pcos')} className="glass-card p-6 text-left hover:-translate-y-1 transition-transform">
            <Stethoscope className="text-blossom-500 mb-3" aria-hidden="true" />
            <h2 className="font-display font-semibold text-ink-900">{t('nearbyCare.pcosCare')}</h2>
          </button>
          <button onClick={() => chooseConcern('breast')} className="glass-card p-6 text-left hover:-translate-y-1 transition-transform">
            <Ribbon className="text-blossom-500 mb-3" aria-hidden="true" />
            <h2 className="font-display font-semibold text-ink-900">{t('nearbyCare.breastCare')}</h2>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate('/nearby-care')}
        className="flex items-center gap-1 text-sm font-friendly text-ink-700/70 hover:text-blossom-500 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" /> {t('common.back')}
      </button>

      <h1 className="font-display font-bold text-xl text-ink-900 mb-8">
        {concern === 'pcos' ? t('nearbyCare.pcosCare') : t('nearbyCare.breastCare')}
      </h1>

      {stage === 'location' && (
        <LocationPermission onGranted={(c) => runSearch(c)} onSkip={() => runSearch(undefined)} />
      )}

      {stage === 'loading' && (
        <p className="text-center text-sm font-friendly text-ink-700/70">{t('nearbyCare.searching')}</p>
      )}

      {stage === 'error' && (
        <div className="glass-card p-6 text-center max-w-md mx-auto">
          <p className="text-sm font-friendly text-red-600 mb-4">{t('nearbyCare.searchError')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => runSearch(coords)} className="btn-secondary">
              <RefreshCcw size={14} aria-hidden="true" /> {t('common.retry')}
            </button>
            <a
              href={buildMapsSearchUrl(concernSearchQuery(concern), coords)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <ExternalLink size={14} aria-hidden="true" /> {t('nearbyCare.openInMaps')}
            </a>
          </div>
        </div>
      )}

      {stage === 'results' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {enhanced && facilities && facilities.length > 0 && (
            <div className="space-y-4">
              {facilities.map((f) => (
                <HospitalCard key={f.id} facility={f} />
              ))}
            </div>
          )}

          {enhanced && facilities && facilities.length === 0 && (
            <div className="glass-card p-6 text-center max-w-md mx-auto">
              <p className="text-sm font-friendly text-ink-700/70 mb-4">{t('nearbyCare.noResults')}</p>
              <a
                href={buildMapsSearchUrl(concernSearchQuery(concern), coords)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink size={14} aria-hidden="true" /> {t('nearbyCare.openInMaps')}
              </a>
            </div>
          )}

          {!enhanced && (
            <div className="glass-card p-6 text-center max-w-md mx-auto">
              <p className="text-sm font-body text-ink-700/70 mb-4">{t('nearbyCare.searchNotConfigured')}</p>
              <a
                href={buildMapsSearchUrl(concernSearchQuery(concern), coords)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink size={14} aria-hidden="true" /> {t('nearbyCare.openInMaps')}
              </a>
            </div>
          )}

          <p className="text-xs text-ink-700/50 font-body text-center mt-6">{t('nearbyCare.disclaimer')}</p>
        </motion.div>
      )}
    </div>
  )
}
