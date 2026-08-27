import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import FloatingBackground from './components/FloatingBackground'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIAssistant from './components/AIAssistant'
import Landing from './pages/Landing'

/**
 * Route-level code splitting. Previously every page — including jsPDF's
 * two ~350KB embedded font files reachable from Results, and everything
 * Screening/NearbyCare/Feedback need — shipped in one bundle loaded by
 * every visitor, even someone who only ever looks at Home. Landing stays
 * a static import since it's the entry point almost everyone hits first;
 * everything else loads on the route that actually needs it.
 */
const Education = lazy(() => import('./pages/Education'))
const Screening = lazy(() => import('./pages/Screening'))
const Results = lazy(() => import('./pages/Results'))
const About = lazy(() => import('./pages/About'))
const NearbyCare = lazy(() => import('./pages/NearbyCare'))
const Feedback = lazy(() => import('./pages/Feedback'))

/** Minimal, brand-consistent — intentionally not a full loading screen, since route transitions should feel instant on a good connection and this only shows at all on a slow one. */
function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 rounded-full border-2 border-blossom-300 border-t-blossom-500 animate-spin" aria-label="Loading" role="status" />
    </div>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <FloatingBackground />
      <Navbar />
      <main className="relative z-10">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/education" element={<Education />} />
            <Route path="/screening/:moduleId" element={<Screening />} />
            <Route path="/results/:moduleId" element={<Results />} />
            <Route path="/nearby-care" element={<NearbyCare />} />
            <Route path="/nearby-care/:concern" element={<NearbyCare />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  )
}
