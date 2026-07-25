import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react'
import { MODULE_LIST, MODULES } from '../data/questions'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 }
  })
}

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-10 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-blossom-100 text-blossom-500 px-4 py-1.5 text-xs font-friendly font-semibold mb-6"
        >
          <ShieldCheck size={14} aria-hidden="true" /> {t('landing.trustBar')}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display font-bold text-4xl md:text-6xl text-ink-900 leading-tight"
        >
          {t('landing.heroHeadline')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-lg font-body text-ink-700/80 max-w-xl mx-auto"
        >
          {t('landing.heroSub')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#modules" className="btn-primary">
            <HeartPulse size={18} aria-hidden="true" /> {t('landing.startScreening')}
          </a>
          <Link to="/education" className="btn-secondary">
            {t('landing.learnMore')}
          </Link>
        </motion.div>
      </section>

      {/* Screening modules */}
      <section id="modules" className="pb-24">
        <h2 className="font-display font-semibold text-2xl text-ink-900 text-center mb-10">
          {t('landing.modulesTitle')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {MODULE_LIST.map((id, i) => {
            const mod = MODULES[id]
            const key = id === 'breast-cancer' ? 'breastCancer' : id
            return (
              <motion.div
                key={id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
              >
                <Link
                  to={`/screening/${id}`}
                  className="glass-card block h-full p-7 hover:-translate-y-1 transition-transform"
                >
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blossom-300 to-blossom-500 text-white flex items-center justify-center mb-4">
                    <Sparkles size={20} aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink-900 mb-2">
                    {t(`landing.${key}`)}
                  </h3>
                  <p className="text-sm font-body text-ink-700/75 leading-relaxed">
                    {t(`landing.${key}Desc`)}
                  </p>
                  <p className="mt-4 text-xs font-friendly text-blossom-500 font-semibold">
                    {mod.questions.length} {t('nav.screenings')}
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
