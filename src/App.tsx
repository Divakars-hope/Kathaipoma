import { Routes, Route } from 'react-router-dom'
import FloatingBackground from './components/FloatingBackground'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIAssistant from './components/AIAssistant'
import Landing from './pages/Landing'
import Education from './pages/Education'
import Screening from './pages/Screening'
import Results from './pages/Results'
import About from './pages/About'

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <FloatingBackground />
      <Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/education" element={<Education />} />
          <Route path="/screening/:moduleId" element={<Screening />} />
          <Route path="/results/:moduleId" element={<Results />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  )
}
