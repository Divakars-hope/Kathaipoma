import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface BackButtonProps {
  /** Where to go if there's genuinely no in-app history to go back to (e.g. this page was opened directly from a shared link or a fresh tab). Defaults to home. */
  fallback?: string
  className?: string
  label?: string
  /** Override the default history-navigation behavior — e.g. a multi-step page (like NearbyCare's concern picker) that needs "back" to mean "previous in-page step," not "previous route." */
  onClick?: () => void
}

/**
 * Respects real navigation history instead of hard-coding every "back" to
 * Home. `location.key === 'default'` is React Router's own signal that
 * there is no prior entry in *this* router's history stack (a fresh
 * load/direct link) — in that one case, `navigate(-1)` would either do
 * nothing or leave the app entirely, so we fall back to a sane default
 * route instead. Everywhere else, this simply goes back one step, the
 * same as the browser's own Back button, Android's system Back, and iOS's
 * edge-swipe gesture — none of which this component interferes with,
 * since those operate on the WebView/browser history stack directly.
 *
 * Pass `onClick` to override this for pages where "back" means an
 * in-page step (like a multi-stage flow), not a route change.
 */
export default function BackButton({ fallback = '/', className = '', label, onClick }: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label ?? t('common.back')}
      className={`flex items-center gap-1 text-sm font-friendly text-ink-700/70 hover:text-blossom-500 py-2.5 -my-2.5 ${className}`}
    >
      <ChevronLeft size={16} aria-hidden="true" /> {label ?? t('common.back')}
    </button>
  )
}
