// ─────────────────────────────────────────────────────────────────────────────
// NavBar.jsx — Top navigation bar with breadcrumbs and voice settings trigger
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { Settings, Volume2, ChevronRight, Home } from 'lucide-react'
import useStore, { VIEWS, VOICE_PROFILES } from './store'
import { ALPHABETS } from './alphabetData'

export default function NavBar() {
  const {
    currentView, selectedAlphabetId, learningMode,
    setView, toggleVoiceSettings, selectedVoiceId, isPlaying,
  } = useStore()

  const alphabet = selectedAlphabetId ? ALPHABETS[selectedAlphabetId] : null
  const voiceName = VOICE_PROFILES.find(v => v.id === selectedVoiceId)?.name ?? selectedVoiceId

  // Build breadcrumb trail
  const crumbs = [{ label: 'Alphabets', view: VIEWS.HOME }]
  if (currentView !== VIEWS.HOME) crumbs.push({ label: 'Select Script', view: VIEWS.ALPHABET_SELECT })
  if (alphabet && [VIEWS.MODE_SELECT, VIEWS.LESSON, VIEWS.QUIZ].includes(currentView)) {
    crumbs.push({ label: alphabet.name, view: VIEWS.MODE_SELECT })
  }
  if (currentView === VIEWS.LESSON) crumbs.push({ label: 'Lesson', view: null })
  if (currentView === VIEWS.QUIZ)   crumbs.push({ label: 'Quiz',   view: null })

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b"
            style={{ background: 'rgba(8,9,13,0.85)', backdropFilter: 'blur(20px)', borderColor: 'var(--c-border)' }}>
      {/* Left: Logo + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo */}
        <button onClick={() => setView(VIEWS.HOME)}
                className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Α
          </div>
          <span className="font-bold text-sm tracking-wide gradient-text hidden sm:block">Alphabets</span>
        </button>

        {/* Breadcrumbs */}
        {crumbs.length > 1 && (
          <nav className="flex items-center gap-1 min-w-0 overflow-hidden">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 shrink-0">
                {i > 0 && <ChevronRight size={13} style={{ color: 'var(--c-muted)' }} />}
                {crumb.view && i < crumbs.length - 1 ? (
                  <button onClick={() => setView(crumb.view)}
                          className="text-xs px-1.5 py-0.5 rounded transition-colors hover:text-white"
                          style={{ color: 'var(--c-sub)' }}>
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-xs font-medium px-1.5" style={{ color: i === crumbs.length - 1 ? 'var(--c-text)' : 'var(--c-sub)' }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: Voice indicator + Settings */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Audio activity indicator */}
        {isPlaying && (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--c-emerald)', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }}
          />
        )}

        {/* Voice label */}
        <button onClick={toggleVoiceSettings}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all btn-ghost"
                style={{ color: 'var(--c-sub)' }}>
          <Volume2 size={13} />
          <span>{voiceName}</span>
        </button>

        {/* Settings icon */}
        <button onClick={toggleVoiceSettings}
                className="p-2 rounded-lg transition-all btn-ghost"
                style={{ color: 'var(--c-sub)' }}>
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
