import { useTranslation } from 'react-i18next'
import type { RiskLevel } from '../data/riskEngine'

const LEVEL_CONFIG: Record<RiskLevel, { pct: number; color: string; labelKey: string }> = {
  low: { pct: 25, color: '#4ADE80', labelKey: 'results.low' },
  moderate: { pct: 60, color: '#F59E0B', labelKey: 'results.moderate' },
  high: { pct: 90, color: '#EF4444', labelKey: 'results.high' }
}

export default function RiskMeter({ level, score }: { level: RiskLevel; score: number }) {
  const { t } = useTranslation()
  const cfg = LEVEL_CONFIG[level]

  return (
    <div className="glass-card p-6">
      <p className="font-display font-semibold text-ink-900 mb-3">{t('results.riskLevel')}</p>
      <div className="h-4 w-full rounded-full bg-ink-900/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${cfg.pct}%`, backgroundColor: cfg.color }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-friendly font-semibold" style={{ color: cfg.color }}>
          {t(cfg.labelKey)}
        </span>
        <span className="text-xs text-ink-700/60">{t('results.healthScore')}: {score}/100</span>
      </div>
    </div>
  )
}
