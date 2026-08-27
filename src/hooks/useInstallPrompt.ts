import { useCallback, useEffect, useState } from 'react'

const DISMISS_KEY = 'kathaipoma_install_dismissed_at'
// A closed prompt comes back after this long — closing it once shouldn't
// mean "never offer this again." Chrome's own re-prompt guidance for
// beforeinstallprompt suggests a cooldown in this general range rather
// than a permanent suppression.
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia?.('(display-mode: standalone)').matches
  // iOS Safari doesn't support the display-mode media query the same way;
  // it exposes this non-standard boolean instead when the app was launched
  // from the home screen.
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return Boolean(mq || iosStandalone)
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIOS && isSafari
}

function recentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const dismissedAt = Number(raw)
    if (Number.isNaN(dismissedAt)) return false
    return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS
  } catch {
    return false
  }
}

/**
 * Centralizes install-prompt state so the home-page card and the compact
 * results-page CTA share one source of truth (and one dismissal record,
 * so dismissing either stops both from nagging — see the component doc).
 *
 * BUG FIX: closing the prompt used to write a permanent flag, so one
 * accidental tap of the × hid install promotion forever with no way back
 * short of clearing site data. Fixed to a 14-day cooldown instead — the
 * × still means "not now," it just doesn't mean "never."
 *
 * Chromium-based browsers (Chrome, Edge, most Android browsers) fire
 * `beforeinstallprompt` when the app is genuinely installable; we capture
 * that event and only offer a real "Install" button when we're actually
 * holding onto one. iOS Safari never fires this event at all — PWAs are
 * still installable there, just via a manual "Share → Add to Home
 * Screen" flow, so that case is surfaced separately as `isIOS` rather
 * than folded into `canInstall`. Anywhere neither applies (e.g. desktop
 * Firefox without install support), nothing is shown — that's the "don't
 * be aggressive about it" requirement satisfied by simply not having
 * anything to offer, not by a special-cased suppression rule.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(recentlyDismissed())

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // best-effort only
    }
  }, [])

  const alreadyStandalone = isStandaloneDisplay() || installed
  const canInstall = Boolean(deferredPrompt) && !alreadyStandalone && !dismissed
  const showIOSGuidance = isIOSSafari() && !alreadyStandalone && !dismissed && !deferredPrompt

  return {
    canInstall,
    showIOSGuidance,
    shouldRender: canInstall || showIOSGuidance,
    promptInstall,
    dismiss
  }
}
