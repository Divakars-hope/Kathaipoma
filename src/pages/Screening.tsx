import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { MODULES, type ModuleId } from '../data/questions'
import ConsentGate from '../components/ConsentGate'
import SpeakButton from '../components/SpeakButton'

export default function Screening() {
  const { moduleId } = useParams<{ moduleId: ModuleId }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isTa = i18n.language === 'ta'

  const mod = moduleId ? MODULES[moduleId] : undefined

  const [consented, setConsented] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const progress = useMemo(() => {
    if (!mod) return 0
    return Math.round(((step + 1) / mod.questions.length) * 100)
  }, [step, mod])

  if (!mod) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="font-body text-ink-700">Unknown screening module.</p>
      </div>
    )
  }

  if (!consented) {
    return (
      <div className="px-6">
        <ConsentGate onAgree={() => setConsented(true)} />
      </div>
    )
  }

  const question = mod.questions[step]
  const selected = answers[question.id]

  const choose = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  const goNext = () => {
    if (step + 1 < mod.questions.length) {
      setStep((s) => s + 1)
    } else {
      // Persist answers for the results page via router state (no storage, stays anonymous)
      navigate(`/results/${mod.id}`, { state: { answers } })
    }
  }

  const goBack = () => {
    if (step === 0) {
      setConsented(false)
    } else {
      setStep((s) => s - 1)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <button
        onClick={goBack}
        className="flex items-center gap-1 text-sm font-friendly text-ink-700/70 hover:text-blossom-500 mb-6"
      >
        <ChevronLeft size={16} aria-hidden="true" /> {t('common.back')}
      </button>

      <h1 className="font-display font-semibold text-xl text-ink-900 mb-1">
        {isTa ? mod.titleTa : mod.titleEn}
      </h1>
      <p className="text-xs font-friendly text-ink-700/60 mb-5">
        {step + 1} / {mod.questions.length}
      </p>

      <div className="h-2 w-full rounded-full bg-ink-900/5 overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-blossom-300 to-blossom-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-7"
        >
          <p className="font-display font-semibold text-lg text-ink-900 leading-snug">
            {isTa ? question.textTa : question.textEn}
          </p>

          <SpeakButton className="mt-4" textEn={question.textEn} textTa={question.textTa} />

          <fieldset className="mt-6 space-y-3">
            <legend className="sr-only">{t('common.selectOne')}</legend>
            {question.options.map((opt) => {
              const active = selected === opt.value
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-xl2 border-2 px-4 py-3.5 cursor-pointer transition-colors font-friendly ${
                    active
                      ? 'border-blossom-400 bg-blossom-50 text-blossom-600'
                      : 'border-ink-900/10 hover:border-blossom-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={opt.value}
                    checked={active}
                    onChange={() => choose(opt.value)}
                    className="h-4 w-4 accent-blossom-500"
                  />
                  {isTa ? opt.labelTa : opt.labelEn}
                </label>
              )
            })}
          </fieldset>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        disabled={!selected}
        onClick={goNext}
        className="btn-primary w-full mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {step + 1 < mod.questions.length ? t('common.next') : t('common.submit')}
      </button>
    </div>
  )
}
