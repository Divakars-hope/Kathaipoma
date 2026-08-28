import { useCallback, useEffect, useState } from 'react'

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

/**
 * Centralizes install-prompt state so the home-page card and the compact
 * results-page CTA share one source of truth.
 *
 * By explicit product decision, this prompt is permanent and NOT
 * dismissible — it only ever disappears once the app is actually
 * installed (standalone mode detected) or on a platform that genuinely
 * doesn't support install at all. There is deliberately no close/×
 * control and no dismissal record in localStorage.
 *
 * Chromium-based browsers (Chrome, Edge, most Android browsers) fire
 * `beforeinstallprompt` when the app is genuinely installable; we capture
 * that event and only offer a real "Install" button when we're actually
 * holding onto one. iOS Safari never fires this event at all — PWAs are
 * still installable there, just via a manual "Share → Add to Home
 * Screen" flow, so that case is surfaced separately as `isIOS` rather
 * than folded into `canInstall`. Anywhere neither applies (e.g. desktop
 * Firefox without install support), nothing is shown.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
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

  const alreadyStandalone = isStandaloneDisplay() || installed
  const canInstall = Boolean(deferredPrompt) && !alreadyStandalone
  const showIOSGuidance = isIOSSafari() && !alreadyStandalone && !deferredPrompt

  return {
    canInstall,
    showIOSGuidance,
    shouldRender: canInstall || showIOSGuidance,
    promptInstall
  }
}
