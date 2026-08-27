import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * React only supports error boundaries as class components — there's no
 * hook equivalent. This is the one legitimate case for a class here.
 *
 * Without this, an unhandled error anywhere in the component tree (a bad
 * date parse, a null a library didn't expect, a translation key shaped
 * unexpectedly) unmounts the entire app to a blank white screen with no
 * way back — the worst possible experience for the low-literacy, anxious
 * users this product is built for. This catches that and shows a plain,
 * non-technical message with a way to recover instead.
 *
 * Deliberately does NOT try to recover in place (React error boundaries
 * can't safely re-render the same broken subtree) — a full reload is the
 * simplest thing that reliably works, and this app has no client-side
 * state worth preserving across a crash (screening answers live in one
 * page's local state already, never a global store).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No analytics/error-reporting service is wired up in this app by
    // design (see the project's privacy stance) — this logs to the
    // console only, for local debugging, and never sends anything
    // anywhere.
    console.error('Kathaipoma crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card p-8 max-w-sm text-center">
            <h1 className="font-display font-semibold text-lg text-ink-900 mb-2">
              Something went wrong.
            </h1>
            <p className="text-sm font-body text-ink-700/75 mb-6">
              Please reload the page. Your answers were not saved anywhere, so nothing is lost.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
