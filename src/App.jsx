// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root application shell with routing and animated view transitions
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useStore, { VIEWS } from './store'
import HomeView from './HomeView'
import AlphabetSelectView from './AlphabetSelectView'
import ModeSelectView from './ModeSelectView'
import LessonView from './LessonView'
import QuizView from './QuizView'
import SettingsPanel from './SettingsPanel'
import NavBar from './NavBar'

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2 } },
}

function ViewRenderer({ view }) {
  switch (view) {
    case VIEWS.HOME:            return <HomeView />
    case VIEWS.ALPHABET_SELECT: return <AlphabetSelectView />
    case VIEWS.MODE_SELECT:     return <ModeSelectView />
    case VIEWS.LESSON:          return <LessonView />
    case VIEWS.QUIZ:            return <QuizView />
    default:                    return <HomeView />
  }
}

export default function App() {
  const { currentView, voiceSettingsOpen, closeVoiceSettings } = useStore()

  // Close settings overlay on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeVoiceSettings() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeVoiceSettings])

  return (
    <div className="relative flex flex-col min-h-dvh bg-mesh" style={{ background: 'var(--c-bg)' }}>
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Top Navigation */}
      <NavBar />

      {/* Main content area */}
      <main className="relative flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col"
          >
            <ViewRenderer view={currentView} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Voice Settings Side Panel */}
      <AnimatePresence>
        {voiceSettingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeVoiceSettings}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            {/* Panel */}
            <motion.div
              key="settings-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed right-0 top-0 h-full z-50 w-full max-w-sm"
            >
              <SettingsPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
