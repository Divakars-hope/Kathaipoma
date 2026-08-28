import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, RefreshCcw, MapPin } from 'lucide-react'
import { MODULES, type ModuleId } from '../data/questions'
import { scoreModule } from '../data/riskEngine'
import { RECOMMENDATIONS, riskLevelSuggestsDoctorVisit } from '../data/recommendations'
import RiskMeter from '../components/RiskMeter'
import EmergencyWarning from '../components/EmergencyWarning'
import InstallPrompt from '../components/InstallPrompt'
import BackButton from '../components/BackButton'
import { currentAppLanguage, pickLang } from '../utils/localize'
import type { HealthConcern } from '../utils/nearbyHospitals'

/** Only breast-cancer and pcos currently map to a Nearby Care concern — menopause has no dedicated facility category requested for this feature. */
const NEARBY_CARE_CONCERN: Partial<Record<ModuleId, HealthConcern>> = {
  'breast-cancer': 'breast',
  pcos: 'pcos'
}

export default function Results() {
  const { moduleId } = useParams<{ moduleId: ModuleId }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const lang = currentAppLanguage(i18n.language)

  const mod = moduleId ? MODULES[moduleId] : undefined
  const answers = (location.state as { answers?: Record<string, string> } | null)?.answers

  if (!mod || !answers) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="font-body text-ink-700 mb-6">
          No results to show yet — please complete a screening first.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('common.backHome')}
        </button>
      </div>
    )
  }

  const result = scoreModule(mod.id, answers)
  const rec = RECOMMENDATIONS[mod.id]
  const showDoctorNote = riskLevelSuggestsDoctorVisit(result.level)

  const downloadPdf = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { registerPdfFonts, setPdfLangFont } = await import('../utils/pdfLang')
    const doc = new jsPDF()

    // jsPDF's built-in fonts only cover Latin glyphs — without this,
    // Tamil and Hindi text in the downloaded PDF shows as boxes or the
    // wrong symbols instead of the actual script.
    registerPdfFonts(doc)
    setPdfLangFont(doc, lang)

    const title = pickLang(lang, mod.titleEn, mod.titleTa, mod.titleHi)
    let y = 20
    doc.setFontSize(16)
    doc.text('AUREVA - ' + title, 14, y)
    y += 10
    doc.setFontSize(11)
    doc.text(`Health awareness score: ${result.healthScore}/100`, 14, y)
    y += 7
    doc.text(`Risk level: ${result.level.toUpperCase()}`, 14, y)
    y += 10
    doc.setFontSize(12)
    doc.text('Lifestyle tips:', 14, y)
    y += 7
    doc.setFontSize(10)
    ;(lang === 'ta' ? rec.tipsTa : lang === 'hi' ? rec.tipsHi : rec.tipsEn).forEach((line) => {
      const wrapped = doc.splitTextToSize(`- ${line}`, 180)
      doc.text(wrapped, 14, y)
      y += wrapped.length * 5.5
    })
    y += 5
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(
      doc.splitTextToSize(
        'AUREVA is an awareness and preliminary screening tool, not a medical diagnosis. Please consult a qualified doctor.',
        180
      ),
      14,
      y
    )
    doc.save(`aureva-${mod.id}-results.pdf`)
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <BackButton className="mb-6" />

      <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">{t('results.title')}</h1>
      <p className="text-sm font-body text-ink-700/70 mb-6">{pickLang(lang, mod.titleEn, mod.titleTa, mod.titleHi)}</p>

      {result.emergency && <EmergencyWarning />}

      <RiskMeter level={result.level} score={result.healthScore} />

      <div className="glass-card p-6 mt-6">
        <h2 className="font-display font-semibold text-ink-900 mb-3">{t('results.diet')}</h2>
        <ul className="space-y-2 text-sm font-friendly text-ink-700">
          {(lang === 'ta' ? rec.dietTa : lang === 'hi' ? rec.dietHi : rec.dietEn).map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-blossom-400">•</span> {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6 mt-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3">{t('results.exercise')}</h2>
        <ul className="space-y-2 text-sm font-friendly text-ink-700">
          {(lang === 'ta' ? rec.exerciseTa : lang === 'hi' ? rec.exerciseHi : rec.exerciseEn).map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-blossom-400">•</span> {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6 mt-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3">{t('results.lifestyle')}</h2>
        <ul className="space-y-2 text-sm font-friendly text-ink-700">
          {(lang === 'ta' ? rec.tipsTa : lang === 'hi' ? rec.tipsHi : rec.tipsEn).map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-blossom-400">•</span> {line}
            </li>
          ))}
        </ul>
      </div>

      {showDoctorNote && (
        <p className="text-sm font-friendly text-blossom-600 bg-blossom-50 rounded-xl2 p-4 mt-6 text-center">
          {t('results.seeDoctor')}
        </p>
      )}

      <p className="text-xs text-ink-700/60 font-body text-center mt-6">{t('results.disclaimer')}</p>

      <div className="flex flex-wrap gap-3 mt-8">
        <button onClick={downloadPdf} className="btn-secondary flex-1">
          <Download size={16} aria-hidden="true" /> {t('common.downloadPdf')}
        </button>
        <button onClick={() => navigate(`/screening/${mod.id}`)} className="btn-primary flex-1">
          <RefreshCcw size={16} aria-hidden="true" /> {t('common.restart')}
        </button>
      </div>

      {NEARBY_CARE_CONCERN[mod.id] && (
        <Link
          to={`/nearby-care/${NEARBY_CARE_CONCERN[mod.id]}`}
          className="glass-card flex items-center gap-4 p-5 mt-6 hover:-translate-y-0.5 transition-transform"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blossom-300 to-blossom-500 text-white flex items-center justify-center shrink-0">
            <MapPin size={18} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink-900 text-sm">{t('nearbyCare.resultsSectionTitle')}</h3>
            <p className="text-xs font-body text-ink-700/70 mt-0.5">
              {mod.id === 'breast-cancer' ? t('nearbyCare.resultsSubtitleBreast') : t('nearbyCare.resultsSubtitlePcos')}
            </p>
          </div>
        </Link>
      )}

      <InstallPrompt variant="compact" className="mt-6" />
    </div>
  )
}
